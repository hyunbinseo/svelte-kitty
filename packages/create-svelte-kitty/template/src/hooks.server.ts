import { SESSION_COOKIE_NAME, VITE_LOCALE } from '$env/static/private';
import type { Payload } from '$lib/server/authenticate.ts';
import { jwtSecret, payloadToSession } from '$lib/server/authenticate.ts';
import { db } from '$lib/server/database/client.ts';
import { sessionBanTable } from '$lib/server/database/schema.ts';
import type { Handle } from '@sveltejs/kit';
import { and, eq, lt } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { JWSSignatureVerificationFailed } from 'jose/errors';

export const handle: Handle = async ({ event, resolve }) => {
	const jwt = event.cookies.get(SESSION_COOKIE_NAME);

	if (jwt) {
		try {
			// Errors can be thrown. (e.g. JWTClaimValidationFailed, JWTExpired, JWTInvalid)
			// Reference https://github.com/panva/jose/blob/main/docs/modules/util_errors.md
			const { payload } = await jwtVerify<Payload>(jwt, jwtSecret);

			const sessionBan = await db.query.sessionBanTable.findFirst({
				columns: { sessionId: true },
				where: and(
					eq(sessionBanTable.sessionId, payload.jti),
					lt(sessionBanTable.bannedAt, new Date())
				)
			});

			if (sessionBan) throw new Error();

			event.locals.session = payloadToSession(payload);
		} catch (e) {
			if (e instanceof JWSSignatureVerificationFailed) {
				// NOTE Log errors and take actions if needed.
				return new Response(null, { status: 401 });
			}
			event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
			event.locals.session = undefined;
		}
	}

	const response = await resolve(event, {
		// This only works in SSR, when the HTML is sent to the client.
		// If the language can be changed using client-side navigation,
		// `<html lang>` should be updated using client-side JavaScript.
		transformPageChunk: ({ html }) => html.replace('%lang%', VITE_LOCALE)
	});

	try {
		// Reference https://github.com/sveltejs/kit/issues/6790
		response.headers.delete('link');
	} catch {
		// Reference https://github.com/sveltejs/kit/issues/11883
	}

	return response;
};
