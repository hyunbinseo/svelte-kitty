import { PUBLIC_ONBOARD_PATH } from '$env/static/public';
import { resolve } from '$app/paths';
import { createRedirectUrl } from '$lib/server/auth/redirect.ts';
import { sessionRenewalThreshold } from '$lib/server/db/config';
import { redirect } from '@sveltejs/kit';

export const load = ({ depends, locals, url }) => {
	depends('private:session');

	if (!locals.session) redirect(307, createRedirectUrl(resolve('/login'), url));

	if (!locals.session.profile && url.pathname !== PUBLIC_ONBOARD_PATH)
		redirect(307, PUBLIC_ONBOARD_PATH);

	return {
		session: {
			renewalThreshold: sessionRenewalThreshold,
			expiresAt: locals.session.expiresAt.valueOf(),
			isAdmin: locals.session.isAdmin,
			isSuperuser: locals.session.roles.has('superuser'),
		},
	};
};
