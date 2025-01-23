import { dateToSafeISOString } from '@hyunbinseo/tools';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { env, exit } from 'node:process';
import { minLength, object, parse, pipe, string } from 'valibot';
import * as schema from '../src/lib/server/db/schema.ts';

const EnvSchema = object({
	DATABASE_URL: pipe(string(), minLength(1)),
});

const { DATABASE_URL } = parse(EnvSchema, env);

const db = drizzle({
	connection: { source: DATABASE_URL, fileMustExist: true },
	casing: 'snake_case',
	schema,
});

// Consider uploading backups to services such as:
// - Amazon S3 Glacier
// - Azure Archive Storage
// - Cloudflare R2 (Infrequent Access)
// - Google Cloud Storage (Archive)

const path = import.meta.dirname + '/backups';
mkdirSync(path, { recursive: true });
await db.$client.backup(path + `/${dateToSafeISOString()}.db`);

exit();
