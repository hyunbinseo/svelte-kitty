import { PUBLIC_ONBOARD_PATH } from '$env/static/public';
import { sessionRenewalThreshold } from '$lib/server/db/config.ts';
import { redirect } from '@sveltejs/kit';

export const load = ({ depends, locals, url }) => {
	depends('private:session');

	if (!locals.session)
		redirect(302, `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);

	if (!locals.session.profile && url.pathname !== PUBLIC_ONBOARD_PATH)
		redirect(302, PUBLIC_ONBOARD_PATH);

	return {
		session: {
			renewalThreshold: sessionRenewalThreshold,
			expiresAt: locals.session.expiresAt.valueOf(),
			isAdmin: locals.session.isAdmin,
			isSuperuser: locals.session.roles.has('superuser')
		}
	};
};
