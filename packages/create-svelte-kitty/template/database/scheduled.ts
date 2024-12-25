import { dateToSafeISOString } from '@hyunbinseo/tools';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { exit } from 'node:process';
import { object, parse, string } from 'valibot';
import * as schema from '../src/lib/server/database/schema.ts';

const env = parse(object({ DATABASE_URL: string() }), process.env);

const db = drizzle({
	connection: { source: env.DATABASE_URL, fileMustExist: true },
	casing: 'snake_case',
	schema
});

const path = import.meta.dirname + '/backups';
mkdirSync(path, { recursive: true });
await db.$client.backup(path + `/${dateToSafeISOString()}.sqlite`);

exit();
