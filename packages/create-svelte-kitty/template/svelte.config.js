import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { env } from 'node:process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: env.BUILD_ID ? `build/${env.BUILD_ID}` : undefined,
		}),
		appDir: '_app', // do not change
		typescript: {
			config: (obj) => {
				if (!Array.isArray(obj.include)) throw new TypeError();
				obj.include.push('../db/**/*.js', '../db/**/*.ts');
				return obj;
			},
		},
	},
};

export default config;
