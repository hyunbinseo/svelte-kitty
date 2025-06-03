import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { t } from './i18n';

export const load = (({ locals }) => {
	if (!locals.session?.isAdmin) error(403);
	return { pageTitle: t.pageTitle };
}) satisfies PageServerLoad;
