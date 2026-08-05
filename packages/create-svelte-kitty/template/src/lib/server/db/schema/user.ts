import { isNull, relations } from 'drizzle-orm';
import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
	type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';
import { loginTable } from './login.ts';
import { profileTable } from './profile.ts';
import { roleTable } from './role.ts';

const userId = (): AnySQLiteColumn => userTable.id;

export const userTable = sqliteTable(
	'user',
	{
		id: text().primaryKey().$default(ulid), // sub
		contact: text().notNull(),
		deactivatedAt: integer({ mode: 'timestamp' }),
		deactivatedBy: text().references(userId),
	},
	(t) => [uniqueIndex('active_user_contact_idx').on(t.contact).where(isNull(t.deactivatedAt))],
);

export const userRelations = relations(userTable, ({ many, one }) => ({
	logins: many(loginTable),
	profile: one(profileTable),
	roles: many(roleTable),
}));
