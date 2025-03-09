import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default tseslint.config(
	includeIgnoreFile(import.meta.dirname + '/.gitignore'),
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		ignores: ['eslint.config.js', 'svelte.config.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: tseslint.parser,
				svelteConfig,
			},
		},
	},
	{ ignores: ['.svelte-kit/', 'build/', 'dist/', 'drizzle/'] },
	{
		rules: {
			'@typescript-eslint/no-restricted-imports': ['error', 'assert', 'node:assert'],
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'no-restricted-imports': 'off',
			'no-unused-vars': 'off',
		},
	},
);
