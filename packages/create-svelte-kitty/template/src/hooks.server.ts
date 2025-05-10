import { SESSION_COOKIE_NAME } from '$env/static/private';
import { PUBLIC_LOCALE } from '$env/static/public';
import { payloadToSession, verifyJwt } from '$lib/server/authentication.ts';
import type { Handle } from '@sveltejs/kit';
import { JWSSignatureVerificationFailed } from 'jose/errors';

export const handle: Handle = async ({ event, resolve }) => {
	const jwt = event.cookies.get(SESSION_COOKIE_NAME);

	if (jwt) {
		try {
			const result = await verifyJwt(jwt);
			event.locals.session = payloadToSession(result.payload);
		} catch (e) {
			if (e instanceof JWSSignatureVerificationFailed) {
				// NOTE Monitor errors and take actions if needed.
			}
			event.cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
			event.locals.session = undefined;
		}
	}

	const response = await resolve(event, {
		// This only works in SSR, when the HTML is sent to the client.
		// If the language can be changed using client-side navigation,
		// `<html lang>` should be updated using client-side JavaScript.
		transformPageChunk: ({ html }) => html.replace('%lang%', PUBLIC_LOCALE),
	});

	try {
		// Reference https://github.com/sveltejs/kit/issues/6790
		response.headers.delete('link');
	} catch {
		// Reference https://github.com/sveltejs/kit/issues/11883
	}

	return response;
};
