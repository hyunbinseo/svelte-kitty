import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Reference https://caniuse.com/sr_es14
	// Reference https://caniuse.com/css-nesting
	build: { target: 'es2023', cssTarget: ['firefox117'] },
	plugins: [sveltekit()],
});
