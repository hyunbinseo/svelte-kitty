import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import { resolve } from 'node:path';
import ts from 'typescript-eslint';

export default defineConfig(
	includeIgnoreFile(resolve(import.meta.dirname, '.gitignore')),
	js.configs.recommended,
	ts.configs.recommended,
	prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: { 'no-undef': 'off' },
	},
	{
		rules: {
			'no-console': ['error', { allow: ['warn', 'error'] }],
		},
	},
);
