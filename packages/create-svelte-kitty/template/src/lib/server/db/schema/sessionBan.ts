import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ip } from '../columns.ts';
import { sessionTable } from './session.ts';
import { userTable } from './user.ts';

export const sessionBanTable = sqliteTable('session_ban', {
	sessionId: text()
		.primaryKey()
		.references(() => sessionTable.id),
	bannedAt: integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date()),
	bannedBy: text()
		.references(() => userTable.id)
		.notNull(),
	ip
});
