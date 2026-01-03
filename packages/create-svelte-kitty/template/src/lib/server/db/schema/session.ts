import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';
import { ip } from '../columns';
import { sessionExpiresInSeconds } from '../config';
import { loginTable } from './login';
import { userTable } from './user';

export const sessionTable = sqliteTable(
	'session',
	{
		id: text().primaryKey().$default(ulid), // jti
		userId: text()
			.notNull()
			.references(() => userTable.id),
		loginId: text().references(() => loginTable.id),
		issuedAt: integer({ mode: 'timestamp' })
			.notNull()
			.$default(() => new Date()),
		expiresAt: integer({ mode: 'timestamp' })
			.notNull()
			.$default(() => new Date(Date.now() + sessionExpiresInSeconds * 1_000)),
		ip,
	},
	(t) => [index('idx_session_user_id').on(t.userId)],
);
