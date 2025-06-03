import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';
import { loginTable } from './login';
import { profileTable } from './profile';
import { roleTable } from './role';

const userId = (): AnySQLiteColumn => userTable.id;

export const userTable = sqliteTable('user', {
	id: text().primaryKey().$default(ulid), // sub
	contact: text().notNull(),
	deactivatedAt: integer({ mode: 'timestamp' }),
	deactivatedBy: text().references(userId),
});

export const userRelations = relations(userTable, ({ many, one }) => ({
	logins: many(loginTable),
	profile: one(profileTable),
	roles: many(roleTable),
}));
