import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { unixEpoch } from '../utilities';
import { userTable } from './user';

export const profileTable = sqliteTable('profile', {
	userId: text()
		.primaryKey()
		.references(() => userTable.id),
	surname: text().notNull(),
	givenName: text().notNull(),
	createdAt: integer({ mode: 'timestamp' }).notNull().default(unixEpoch()),
	updatedAt: integer({ mode: 'timestamp' }).$onUpdate(unixEpoch),
});

export const profileRelations = relations(profileTable, ({ one }) => ({
	user: one(userTable, { fields: [profileTable.userId], references: [userTable.id] }),
}));
