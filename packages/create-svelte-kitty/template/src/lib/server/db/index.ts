import { dev } from '$app/environment';
import { DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.ts';

// The `DATABASE_URL` variable differs in `dev`, `build`, and `preview`,
// because Vite imports different `.env` files according to the mode.
// Reference https://vitejs.dev/guide/env-and-mode#env-files
// Reference https://vitejs.dev/guide/env-and-mode#modes

export const db = drizzle({
	connection: { source: DATABASE_URL, fileMustExist: true },
	casing: 'snake_case',
	schema,
});

// It's recommended to turn on WAL mode to greatly increase overall performance.
// Reference https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md

if (!dev) db.$client.pragma('journal_mode = WAL');

// Handle cases where `process` or `process.on` is unavailable in edge runtimes.
// Reference https://developers.cloudflare.com/workers/runtime-apis/nodejs/process
// Reference https://vercel.com/docs/functions/runtimes/edge-runtime

if (
	typeof process !== 'undefined' && //
	typeof process.on === 'function'
) {
	// Reference https://svelte.dev/docs/kit/adapter-node#graceful-shutdown
	process.on('sveltekit:shutdown', async () => {
		await db.$client.close();
	});
}
