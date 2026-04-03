import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import globals from 'globals';
import { resolve } from 'node:path';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	includeIgnoreFile(resolve(import.meta.dirname, '.gitignore')),
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	{
		rules: {
			'no-console': ['error', { allow: ['warn', 'error'] }],
		},
	},
);
