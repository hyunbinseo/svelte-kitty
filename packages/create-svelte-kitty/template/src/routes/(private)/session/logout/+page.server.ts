import { banCurrentSession } from '$lib/server/authenticate.ts';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (e) => {
		if (!e.locals.session) return redirect(302, '/');
		await banCurrentSession(e, e.locals.session);
		redirect(302, '/');
	},
};
