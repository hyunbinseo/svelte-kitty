import { toReadonly } from '@hyunbinseo/tools';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';
import { userTable } from './user.ts';

export type Role = (typeof Roles)[number];
export const Roles = ['admin', 'superuser'] as const;
export const roles = toReadonly(new Set(Roles));

export const roleTable = sqliteTable(
	'role',
	{
		id: text().primaryKey().$default(ulid),
		userId: text()
			.notNull()
			.references(() => userTable.id),
		role: text({ enum: Roles }).notNull(),
		assignedBy: text()
			.notNull()
			.references(() => userTable.id),
		revokedAt: integer({ mode: 'timestamp' }),
		revokedBy: text().references(() => userTable.id)
	},
	(table) => ({
		userIdIdx: index('idx_role_user_id').on(table.userId)
	})
);

export const roleRelations = relations(roleTable, ({ one }) => ({
	user: one(userTable, { fields: [roleTable.userId], references: [userTable.id] })
}));
