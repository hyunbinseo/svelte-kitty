import { banCurrentSession } from '$lib/server/authentication.ts';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (e) => {
		if (!e.locals.session) return redirect(303, '/');
		await banCurrentSession(e, e.locals.session);
		redirect(303, '/');
	},
};
