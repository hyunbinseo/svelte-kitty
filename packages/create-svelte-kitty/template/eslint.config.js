import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { join } from 'node:path';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default defineConfig(
	includeIgnoreFile(join(import.meta.dirname, '.gitignore')),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: { 'no-undef': 'off' },
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
	{ ignores: ['.svelte-kit/', 'build/', 'dist/', 'drizzle/'] },
	{
		rules: {
			'@typescript-eslint/no-restricted-imports': ['error', 'assert', 'node:assert'],
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'no-restricted-imports': 'off',
		},
	},
);
