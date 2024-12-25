import { db } from '$lib/server/db/index.ts';
import { profileTable, userTable } from '$lib/server/db/schema.ts';
import { pickTableColumns } from '$lib/server/db/utilities.ts';
import { parseOrErrorPage } from '$lib/utilities.ts';
import { error } from '@sveltejs/kit';
import { and, asc, desc, eq, inArray, isNotNull, isNull, ne, sql } from 'drizzle-orm';
import { array, excludes, minLength, pipe, string, ulid } from 'valibot';
import { banUserSessions } from '../index.server.ts';
import type { PageServerLoad } from './$types.js';
import { t } from './i18n.ts';

export const load = (async ({ locals, url }) => {
	if (!locals.session?.roles.has('superuser')) error(403);

	const showDeactivated = url.searchParams.has('deactivated');

	const users = await db
		.select({
			...pickTableColumns(userTable, ['id', 'contact']),
			...(showDeactivated ? { deactivatedAt: userTable.deactivatedAt } : {}),
			profile: pickTableColumns(profileTable, ['givenName', 'surname'])
		})
		.from(userTable)
		.leftJoin(profileTable, eq(profileTable.userId, userTable.id))
		.where(
			and(
				(!showDeactivated ? isNull : isNotNull)(userTable.deactivatedAt),
				ne(userTable.id, locals.session.userId)
			)
		)
		.orderBy(
			desc(userTable.deactivatedAt),
			// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/1699
			sql`${profileTable.givenName} ASC NULLS LAST`,
			asc(profileTable.surname)
		);

	return { pageTitle: t.pageTitle, showDeactivated, users };
}) satisfies PageServerLoad;

export const actions = {
	deactivate: async (e) => {
		if (!e.locals.session?.roles.has('superuser')) error(403);

		const formData = await e.request.formData();

		const userIds = parseOrErrorPage(
			pipe(
				array(pipe(string(), ulid())), //
				excludes(e.locals.session.userId),
				minLength(1)
			),
			formData.getAll('user-id')
		);

		await db
			.update(userTable)
			.set({
				deactivatedAt: new Date(),
				deactivatedBy: e.locals.session.userId
			})
			.where(
				and(
					inArray(userTable.id, userIds), //
					isNull(userTable.deactivatedAt)
				)
			);

		await banUserSessions(e, e.locals.session, userIds);
	}
};
