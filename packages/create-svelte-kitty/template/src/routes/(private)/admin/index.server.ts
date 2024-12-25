import { db } from '$lib/server/db/index.ts';
import { sessionBanTable, sessionTable } from '$lib/server/db/schema.ts';
import { type RequestEvent } from '@sveltejs/kit';
import { and, gt, inArray, sql } from 'drizzle-orm';

type Session = NonNullable<App.Locals['session']>;

// Convert this into a prepared statement.
// Remove aliases in the `INSERT INTO table SELECT ...;` statement.
// Blocked by https://github.com/drizzle-team/drizzle-orm/issues/3656

export const banUserSessions = (e: RequestEvent, session: Session, userIds: string[]) =>
	db
		.insert(sessionBanTable)
		.select(
			db
				.select({
					sessionId: sessionTable.id,
					bannedAt: sql`${Math.floor(Date.now() / 1000)}`.as('banned_at'),
					bannedBy: sql`${session.userId}`.as('banned_by'),
					ip: sql`${e.getClientAddress()}`.as('ip')
				})
				.from(sessionTable)
				.where(
					and(
						inArray(sessionTable.userId, userIds), //
						gt(sessionTable.expiresAt, new Date())
					)
				)
		)
		.onConflictDoNothing();
