import { defineConfig } from 'drizzle-kit';
import { loadEnvFile } from 'node:process';
import { object, parse, string } from 'valibot';

loadEnvFile('.env.development');

const env = parse(object({ DATABASE_URL: string() }), process.env);

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/db/schema.ts',
	dbCredentials: { url: env.DATABASE_URL },
	casing: 'snake_case',
	verbose: true,
	strict: true
});
