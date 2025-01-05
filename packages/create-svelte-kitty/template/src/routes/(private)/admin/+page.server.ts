import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { t } from './i18n.ts';

export const load = (({ locals }) => {
	if (!locals.session?.isAdmin) error(403);
	return { pageTitle: t.pageTitle };
}) satisfies PageServerLoad;
