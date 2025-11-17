import { sveltekit } from '@sveltejs/kit/vite';
import { globSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { env } from 'node:process';
import { defineConfig } from 'vite';

export default defineConfig({
	build: { target: 'es2023' },
	plugins: [
		sveltekit(),
		{
			name: 'delete-static',
			closeBundle: () => {
				const { BUILD_ID } = env;
				if (!BUILD_ID) return;

				const outDir = join(import.meta.dirname, './build', BUILD_ID);

				const paths = globSync('./client/*', {
					exclude: ['./client/_app'],
					cwd: outDir,
				}).map((path) => join(outDir, path));

				for (const path of paths) rmSync(path, { recursive: true });
			},
		},
	],
});
