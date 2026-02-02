import adapter from '@sveltejs/adapter-node';
import { env } from 'node:process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: env.BUILD_ID ? `build/${env.BUILD_ID}` : undefined,
		}),
		appDir: '_app', // do not change
	},
};

export default config;
