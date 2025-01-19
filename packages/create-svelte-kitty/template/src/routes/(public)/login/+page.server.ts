import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { PUBLIC_PRIVATE_PATH } from '$env/static/public';
import { authenticate } from '$lib/server/authenticate.ts';
import { loginOtpLength } from '$lib/server/db/config.ts';
import { db } from '$lib/server/db/index.ts';
import { loginTable, roleTable, userTable } from '$lib/server/db/schema.ts';
import { pickTableColumns } from '$lib/server/db/utilities.ts';
import { parseOrErrorPage } from '$lib/utilities.ts';
import { formDataToObject } from '@hyunbinseo/tools';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, desc, eq, gt } from 'drizzle-orm';
import { PostmarkSendEmail as sendEmail } from 'new-request';
import { digits, email, length, object, pipe, string, trim, ulid, uuid } from 'valibot';
import type { PageServerLoad } from './$types.ts';
import { t } from './i18n.ts';

// Cannot prerender pages with actions. Magic link will result in a 500 server error.
// Reference https://svelte.dev/docs/kit/page-options#prerender-when-not-to-prerender
export const prerender = false;

export const load = (async ({ locals, url }) => {
	if (locals.session) redirect(302, PUBLIC_PRIVATE_PATH);

	if (!url.searchParams.has('code')) return { pageTitle: t.pageTitle, loginOtpLength };

	const searchParams = parseOrErrorPage(
		object({
			id: pipe(string(), ulid()),
			code: pipe(string(), uuid())
		}),
		{
			id: url.searchParams.get('id'),
			code: url.searchParams.get('code')
		}
	);

	const magicLinkLogin = await db.query.loginTable.findFirst({
		columns: { id: true, code: true },
		where: and(
			eq(loginTable.id, searchParams.id),
			eq(loginTable.code, searchParams.code),
			gt(loginTable.expiresAt, new Date()),
			eq(loginTable.isExpired, false)
		),
		with: { user: { columns: { contact: true } } }
	});

	return {
		pageTitle: t.pageTitle,
		loginOtpLength,
		magicLinkLogin: magicLinkLogin || null
	};
}) satisfies PageServerLoad;

export const actions = {
	send: async ({ fetch, getClientAddress, locals, request, url }) => {
		if (locals.session) redirect(302, PUBLIC_PRIVATE_PATH);

		const formData = await request.formData();

		const contact = parseOrErrorPage(
			pipe(string(), trim(), email()), //
			formData.get('contact')
		);

		const existingUser = await db.query.userTable.findFirst({
			columns: { id: true },
			orderBy: desc(userTable.id),
			where: and(
				eq(userTable.contact, contact), //
				eq(userTable.isDeactivated, false)
			),
			with: {
				logins: {
					columns: { id: true },
					where: and(
						gt(loginTable.expiresAt, new Date()), //
						eq(loginTable.isExpired, false)
					)
				}
			}
		});

		if (existingUser?.logins.length && !dev) return fail(400, { error: 'LOGIN_PENDING' as const });

		const user =
			existingUser ||
			(
				await db
					.insert(userTable) //
					.values({ contact })
					.returning(pickTableColumns(userTable, ['id']))
			)[0];

		if (!existingUser && contact === env.ROOT_ADMIN_CONTACT)
			await db.insert(roleTable).values({
				userId: user.id,
				role: 'superuser',
				assignedBy: user.id
			});

		const [login] = await db
			.insert(loginTable) //
			.values({ userId: user.id, ip: getClientAddress() })
			.returning(pickTableColumns(loginTable, ['id', 'code', 'otp']));

		const magicLink = new URL(url);
		magicLink.search = '';
		magicLink.searchParams.set('id', login.id);
		magicLink.searchParams.set('code', login.code);

		if (dev)
			// eslint-disable-next-line no-console
			console.table({
				Contact: contact,
				MagicLink: magicLink.toString(),
				OTP: login.otp
			});

		if (!dev) {
			const response = await sendEmail(
				{
					...t.template(magicLink, login.otp),
					To: contact
				},
				{
					from: env.EMAIL_SENDER,
					serverToken: env.EMAIL_API_KEY,
					fetch
				}
			);

			if (response instanceof Error || !response.ok) {
				await db
					.update(loginTable)
					.set({ expiredAt: new Date() })
					.where(eq(loginTable.id, login.id));

				return fail(400, { error: 'SEND_FAILED' as const });
			}
		}

		return { loginId: login.id };
	},
	magic: async (e) => {
		if (e.locals.session) redirect(302, PUBLIC_PRIVATE_PATH);

		const formData = await e.request.formData();

		const form = parseOrErrorPage(
			object({
				id: pipe(string(), ulid()),
				code: pipe(string(), uuid())
			}),
			formDataToObject(formData, { get: ['id', 'code'] })
		);

		const magicLinkLogin = (
			await db
				.update(loginTable)
				.set({ expiredAt: new Date() })
				.where(
					and(
						eq(loginTable.id, form.id), //
						eq(loginTable.isExpired, false)
					)
				)
				.returning(pickTableColumns(loginTable, ['id', 'userId', 'code', 'expiresAt']))
		).at(0);

		if (!magicLinkLogin || magicLinkLogin.code !== form.code) error(400);

		if (magicLinkLogin.expiresAt < new Date())
			return fail(400, { error: 'LOGIN_EXPIRED' as const });

		await authenticate(e, magicLinkLogin.userId, magicLinkLogin.id);
		redirect(302, PUBLIC_PRIVATE_PATH);
	},
	otp: async (e) => {
		if (e.locals.session) redirect(302, PUBLIC_PRIVATE_PATH);

		const formData = await e.request.formData();

		const form = parseOrErrorPage(
			object({
				id: pipe(string(), ulid()),
				otp: pipe(string(), digits(), length(loginOtpLength))
			}),
			formDataToObject(formData, { get: ['id', 'otp'] })
		);

		const otpLogin = (
			await db
				.update(loginTable)
				.set({ expiredAt: new Date() })
				.where(
					and(
						eq(loginTable.id, form.id), //
						eq(loginTable.isExpired, false)
					)
				)
				.returning(pickTableColumns(loginTable, ['id', 'userId', 'otp', 'expiresAt']))
		).at(0);

		if (!otpLogin) error(400);
		if (otpLogin.otp !== form.otp) return fail(400, { error: 'OTP_INVALID' as const });
		if (otpLogin.expiresAt < new Date()) return fail(400, { error: 'LOGIN_EXPIRED' as const });

		await authenticate(e, otpLogin.userId, otpLogin.id);
		redirect(302, PUBLIC_PRIVATE_PATH);
	}
};
