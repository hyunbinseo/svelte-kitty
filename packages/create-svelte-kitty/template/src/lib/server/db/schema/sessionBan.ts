import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ip } from '../columns';
import { unixEpoch } from '../utilities';
import { sessionTable } from './session';
import { userTable } from './user';

export const sessionBanTable = sqliteTable('session_ban', {
	sessionId: text()
		.primaryKey()
		.references(() => sessionTable.id),
	bannedAt: integer({ mode: 'timestamp' }).notNull().default(unixEpoch()),
	bannedBy: text()
		.references(() => userTable.id)
		.notNull(),
	ip,
});
