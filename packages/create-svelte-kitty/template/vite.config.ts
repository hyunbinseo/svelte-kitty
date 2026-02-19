import { sveltekit } from '@sveltejs/kit/vite';
import { globSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { env } from 'node:process';
import { defineConfig } from 'vite';

export default defineConfig({
	build: { target: 'es2023' },
	plugins: [
		sveltekit(),
		{
			name: 'delete-static',
			closeBundle: () => {
				if (!env.SVELTE_KIT_NODE_ADAPTER_OUT) return;
				const outDir = resolve(import.meta.dirname, `./${env.SVELTE_KIT_NODE_ADAPTER_OUT}`);

				const paths = globSync('./client/*', {
					exclude: ['./client/_app'],
					cwd: outDir,
				}).map((path) => join(outDir, path));

				for (const path of paths) rmSync(path, { recursive: true });
			},
		},
	],
});
