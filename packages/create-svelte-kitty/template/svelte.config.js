import adapter from '@sveltejs/adapter-node';
import { env } from 'node:process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ out: env.SVELTE_KIT_NODE_ADAPTER_OUT }),
		appDir: '_app', // do not change
	},
};

export default config;
