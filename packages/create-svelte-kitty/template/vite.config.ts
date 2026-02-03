import { sveltekit } from '@sveltejs/kit/vite';
import { globSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';
import { BUILD_ID } from './shared.js';

export default defineConfig({
	build: { target: 'es2023' },
	plugins: [
		sveltekit(),
		{
			name: 'delete-static',
			closeBundle: () => {
				const outDir = resolve(import.meta.dirname, `./build/${BUILD_ID}`);

				const paths = globSync('./client/*', {
					exclude: ['./client/_app'],
					cwd: outDir,
				}).map((path) => join(outDir, path));

				for (const path of paths) rmSync(path, { recursive: true });
			},
		},
	],
});
