import { PUBLIC_ONBOARD_PATH, PUBLIC_PRIVATE_PATH } from '$env/static/public';
import { getRequestEvent } from '$app/server';
import { resolve } from '$app/paths';
import { createRedirectUrl } from './redirect.ts';
import { redirect } from '@sveltejs/kit';

export const requireSession = () => {
	const event = getRequestEvent();

	if (!event.locals.session) redirect(307, createRedirectUrl(resolve('/login'), event.url));

	if (!event.locals.session.profile && event.url.pathname !== PUBLIC_ONBOARD_PATH)
		redirect(307, PUBLIC_ONBOARD_PATH);

	return event.locals.session;
};

export const requireNoSession = () => {
	const event = getRequestEvent();
	if (event.locals.session) redirect(307, PUBLIC_PRIVATE_PATH);
};
