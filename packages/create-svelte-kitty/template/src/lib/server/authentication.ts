import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE_NAME } from '$env/static/private';
import { base64ToUint8Array } from '$lib/utilities';
import { toReadonly } from '@hyunbinseo/tools';
import { error, type RequestEvent } from '@sveltejs/kit';
import { and, eq, gt, isNull, lt, ne, sql } from 'drizzle-orm';
import { union } from 'drizzle-orm/sqlite-core';
import { decodeJwt, jwtVerify, SignJWT, type JWTPayload } from 'jose';
import type { JOSEError } from 'jose/errors';
import { sessionBanDelay, sessionBanDelayInSeconds } from './db/config';
import { db } from './db';
import { roleTable, sessionBanTable, sessionTable, userTable, type Role } from './db/schema';
import { pickTableColumns } from './db/utilities';

type Payload = {
	profile?: null;
	roles: Array<Role>;
} & Required<Pick<JWTPayload, 'iat' | 'exp' | 'jti' | 'sub'>>;

export const authenticate = async (e: RequestEvent, userId: string, loginId: string | null) => {
	if (e.locals.session) error(500);

	const user = await db.query.userTable.findFirst({
		columns: { id: true },
		where: eq(userTable.id, userId),
		with: {
			profile: { columns: { userId: true } },
			roles: {
				columns: { role: true },
				where: isNull(roleTable.revokedAt),
			},
		},
	});

	if (!user) error(500);

	// The RETURNING clause can only return data to the application.
	// It is not currently possible to divert the RETURNING output into another table or query.
	// Reference https://sqlite.org/lang_returning.html#limitations_and_caveats
	// Reference https://sqlite.org/forum/info/b412619373cdd1b5

	const [session] = await db
		.insert(sessionTable)
		.values({ userId, loginId, ip: e.getClientAddress() })
		.returning(pickTableColumns(sessionTable, ['id', 'issuedAt', 'expiresAt']));

	const jwt = await new SignJWT({
		jti: session.id,
		sub: userId,
		profile: !user.profile ? null : undefined,
		roles: [...new Set(user.roles.map(({ role }) => role))],
	} satisfies Omit<Payload, 'iat' | 'exp'>)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt(session.issuedAt)
		.setExpirationTime(session.expiresAt)
		.sign(base64ToUint8Array(env.JWT_SECRET_CURRENT));

	e.cookies.set(SESSION_COOKIE_NAME, jwt, {
		path: '/',
		expires: session.expiresAt,
		// Enable `Set-Cookie` in Vite dev server environments.
		// Blocked by https://github.com/sveltejs/kit/issues/10438
		secure: !dev || e.url.protocol === 'https:',
	});

	const payload = await decodeJwt<Payload>(jwt);
	e.locals.session = payloadToSession(payload);
};

export const payloadToSession = (payload: Payload): NonNullable<App.Locals['session']> => {
	const roles = toReadonly(new Set(payload.roles));
	return {
		id: payload.jti,
		userId: payload.sub,
		expiresAt: new Date(payload.exp * 1000),
		roles,
		isAdmin: roles.has('admin') || roles.has('superuser'),
		profile: payload.profile !== null,
	};
};

export const verifyJwt = async (jwt: string) => {
	const result = await jwtVerify<Payload>(jwt, base64ToUint8Array(env.JWT_SECRET_CURRENT)) //
		.catch((e: JOSEError) => {
			if (!env.JWT_SECRET_EXPIRED) throw e;
			return jwtVerify<Payload>(jwt, base64ToUint8Array(env.JWT_SECRET_EXPIRED));
		});

	const sessionBan = await db.query.sessionBanTable.findFirst({
		columns: { sessionId: true },
		where: and(
			eq(sessionBanTable.sessionId, result.payload.jti), //
			lt(sessionBanTable.bannedAt, new Date()),
		),
	});

	if (sessionBan) throw new Error();

	return result;
};

type Session = NonNullable<App.Locals['session']>;

export const banCurrentSession = async (
	e: RequestEvent,
	session: Session,
	options?: { delay: true },
) => {
	await db
		.insert(sessionBanTable)
		.values({
			sessionId: session.id,
			bannedAt: options?.delay ? new Date(Date.now() + sessionBanDelay) : undefined,
			bannedBy: session.userId,
			ip: e.getClientAddress(),
		})
		.onConflictDoNothing();

	e.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	e.locals.session = undefined;
};

// Convert these into a prepared statements.
// Remove aliases in the `INSERT INTO table SELECT ...;` statement.
// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/3656

export const banCurrentSessions = async (
	e: RequestEvent,
	session: Session,
	options?: { delay: true },
) => {
	const unixTimestamp = Math.floor(Date.now() / 1000);
	const bannedAtDelayed = sql`${unixTimestamp + sessionBanDelayInSeconds}`.as('banned_at');
	const bannedAtNow = sql`${unixTimestamp}`.as('banned_at');
	const bannedBy = sql`${session.userId}`.as('banned_by');
	const ip = sql`${e.getClientAddress()}`.as('ip');

	await db
		.insert(sessionBanTable)
		.select(
			union(
				db
					.select({
						sessionId: sql`${session.id}`.as('session_id'),
						bannedAt: options?.delay ? bannedAtDelayed : bannedAtNow,
						bannedBy,
						ip,
					})
					.from(sessionTable),
				db
					.select({
						sessionId: sessionTable.id,
						bannedAt: bannedAtNow,
						bannedBy,
						ip,
					})
					.from(sessionTable)
					.where(
						and(
							ne(sessionTable.id, session.id),
							eq(sessionTable.userId, session.userId),
							gt(sessionTable.expiresAt, new Date()),
						),
					),
			),
		)
		.onConflictDoNothing();

	e.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
	e.locals.session = undefined;
};
