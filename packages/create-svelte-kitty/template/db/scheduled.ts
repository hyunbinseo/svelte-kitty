import { dateToSafeISOString } from '@hyunbinseo/tools';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { exit } from 'node:process';
import { object, parse, string } from 'valibot';
import * as schema from '../src/lib/server/db/schema.ts';

const env = parse(object({ DATABASE_URL: string() }), process.env);

const db = drizzle({
	connection: { source: env.DATABASE_URL, fileMustExist: true },
	casing: 'snake_case',
	schema
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
