import adapter from '@sveltejs/adapter-node';
import { BUILD_ID } from './shared.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: `build/${BUILD_ID}`,
		}),
		appDir: '_app', // do not change
	},
};

export default config;
