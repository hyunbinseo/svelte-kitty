import { generatePINString } from '@hyunbinseo/tools';
import { randomUUID } from 'crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';
import { ip } from '../columns.ts';
import { loginExpiresIn, loginOtpLength } from '../config.ts';
import { userTable } from './user.ts';

export const loginTable = sqliteTable(
	'login',
	{
		id: text().primaryKey().$default(ulid),
		userId: text()
			.notNull()
			.references(() => userTable.id),
		code: text().notNull().$default(randomUUID),
		otp: text()
			.notNull()
			.$default(() => generatePINString(loginOtpLength)),
		expiresAt: integer({ mode: 'timestamp' })
			.notNull()
			.$default(() => new Date(Date.now() + loginExpiresIn)),
		expiredAt: integer({ mode: 'timestamp' }),
		ip
	},
	(t) => [index('idx_login_user_id').on(t.userId)]
);

export const loginRelations = relations(loginTable, ({ one }) => ({
	user: one(userTable, { fields: [loginTable.userId], references: [userTable.id] })
}));
