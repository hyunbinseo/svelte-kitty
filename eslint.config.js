import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	includeIgnoreFile(import.meta.dirname + '/.gitignore'),
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
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
			'@typescript-eslint/no-restricted-imports': ['error', 'assert', 'node:assert'],
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'no-restricted-imports': 'off',
			'no-unused-vars': 'off',
		},
	},
);
