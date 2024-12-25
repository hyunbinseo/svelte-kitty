import { includeIgnoreFile } from '@eslint/compat';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	includeIgnoreFile(import.meta.dirname + '/.gitignore'),
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	},
	{ ignores: ['.svelte-kit/', 'build/', 'dist/', 'drizzle/'] },
	{
		rules: {
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'no-restricted-imports': ['error', 'assert', 'node:assert']
		}
	}
);
