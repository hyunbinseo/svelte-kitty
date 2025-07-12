import { generatePINString } from '@hyunbinseo/tools';
import { randomUUID } from 'crypto';
import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';
import { ip } from '../columns';
import { loginExpiresInSeconds, loginOtpLength } from '../config';
import { unixEpoch } from '../utilities';
import { userTable } from './user';

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
			.default(unixEpoch({ offset: loginExpiresInSeconds })),
		expiredAt: integer({ mode: 'timestamp' }),
		ip,
	},
	(t) => [index('idx_login_user_id').on(t.userId)],
);

export const loginRelations = relations(loginTable, ({ one }) => ({
	user: one(userTable, { fields: [loginTable.userId], references: [userTable.id] }),
}));
