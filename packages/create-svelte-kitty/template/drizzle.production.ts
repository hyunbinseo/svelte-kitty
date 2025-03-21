import { defineConfig } from 'drizzle-kit';
import { env, loadEnvFile } from 'node:process';
import { nonEmpty, object, parse, pipe, string } from 'valibot';

loadEnvFile('.env.production');

const EnvSchema = object({
	DATABASE_URL: pipe(string(), nonEmpty()),
});

const { DATABASE_URL } = parse(EnvSchema, env);

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/db/schema.ts',
	dbCredentials: { url: DATABASE_URL },
	casing: 'snake_case',
	verbose: true,
	strict: true,
});
