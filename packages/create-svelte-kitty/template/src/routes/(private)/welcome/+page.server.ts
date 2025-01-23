import { PUBLIC_PRIVATE_PATH } from '$env/static/public';
import { authenticate, banCurrentSessions } from '$lib/server/authenticate.ts';
import { db } from '$lib/server/db/index.ts';
import { profileTable } from '$lib/server/db/schema.ts';
import { parseOrErrorPage } from '$lib/utilities.ts';
import { formDataToObject } from '@hyunbinseo/tools';
import { error, redirect } from '@sveltejs/kit';
import { minLength, object, pipe, string, trim } from 'valibot';
import type { PageServerLoad } from './$types.js';
import { t } from './i18n.ts';

export const load = (({ locals }) => {
	if (!locals.session) error(401);
	if (locals.session.profile) redirect(302, PUBLIC_PRIVATE_PATH);
	return { pageTitle: t.pageTitle };
}) satisfies PageServerLoad;

export const actions = {
	default: async (e) => {
		if (!e.locals.session) error(401);
		if (e.locals.session.profile) redirect(302, PUBLIC_PRIVATE_PATH);

		const formData = await e.request.formData();

		const form = parseOrErrorPage(
			object({
				surname: pipe(string(), trim(), minLength(1)),
				givenName: pipe(string(), trim(), minLength(1)),
			}),
			formDataToObject(formData, { get: ['surname', 'given-name'] }),
		);

		const { userId } = e.locals.session;

		await db
			.insert(profileTable)
			.values({ userId, ...form })
			.onConflictDoUpdate({ target: profileTable.userId, set: form });

		await banCurrentSessions(e, e.locals.session, { delay: true });
		await authenticate(e, userId, null);
		redirect(302, PUBLIC_PRIVATE_PATH);
	},
};
