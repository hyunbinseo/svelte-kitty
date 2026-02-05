import forms from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		// 320px: iPhone SE
		// 360px: Galaxy S24
		// 375px: iPhone SE (2020, 2022)
		// 384px: Galaxy S24+, S24 Ultra
		// 393px: iPhone 16
		// 402px: iPhone 16 Pro
		// 430px: iPhone 16 Plus
		// 440px: iPhone 16 Pro Max
		screens: { xs: '441px', ...defaultTheme.screens },
		extend: {
			boxShadow: {
				bottom: [
					'0px 2px 4px -3px rgba(0, 0, 0, 0.2)',
					'0px 4px 5px -2px rgba(0, 0, 0, 0.14)',
					'0px 1px 10px -10px rgba(0, 0, 0, 0.12)',
				].join(', '),
				top: [
					'0px -2px 4px -3px rgba(0, 0, 0, 0.2)',
					'0px -4px 5px -2px rgba(0, 0, 0, 0.14)',
					'0px -1px 10px -10px rgba(0, 0, 0, 0.12)',
				].join(', '),
			},
			width: { 'screen-xs': '441px' },
		},
	},
	plugins: [
		forms,
		plugin(({ addComponents, addUtilities, addVariant, theme }) => {
			addComponents({
				// tailwindcss-forms@0.5.9
				'.tw-checkbox': {
					'display': 'inline-block',
					'width': theme('width.4'),
					'height': theme('height.4'),
					'flex-shrink': '0',
					'border-width': theme('borderWidth.DEFAULT'),
					'border-color': theme('colors.gray.500'),
					'background-color': theme('colors.white'),
					'vertical-align': 'middle',
					'color': theme('colors.blue.600'),
				},
				// tailwindcss-forms@0.5.9
				'.tw-checkbox-checked': {
					'border-color': 'transparent',
					'background-color': 'currentColor',
					'background-image': `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E")`,
					'background-size': '100% 100%',
					'background-position': 'center',
					'background-repeat': 'no-repeat',
				},
				'.ua-anchor': {
					'@apply cursor-pointer text-blue-800 underline visited:text-violet-800 active:text-red-800':
						'',
				},
				'.btn': {
					'@apply rounded-md px-3 py-2 text-center shadow-sm transition-colors text-smallish': '',
				},
				'.btn-xs': {
					'@apply rounded px-2 py-1 text-sm': '',
				},
				'.btn-sm': {
					'@apply px-2.5 py-1.5': '',
				},
				'.btn-lg': {
					'@apply px-3.5 py-2.5': '',
				},
				'.btn-primary': {
					'@apply bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-100 disabled:hover:bg-none':
						'',
				},
				'.btn-secondary': {
					'@apply bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-none':
						'',
				},
				'.btn-danger': {
					'@apply bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:text-gray-100 disabled:hover:bg-none':
						'',
				},
				'.btn-spinner': {
					'@apply flex items-center justify-center gap-x-[0.3em]': '',
					'@apply before:size-[1em] before:origin-center before:animate-spin before:rounded-full before:border-[0.2em] before:border-solid before:border-current before:border-t-transparent before:opacity-50':
						'',
				},
			});
			addUtilities({
				'.text-smallish': {
					'font-size': '0.9375rem', // 15px
					'line-height': '1.375rem', // 22px
				},
			});
			// See https://github.com/tailwindlabs/tailwindcss/pull/12370
			addVariant('user-valid', '&:user-valid');
			addVariant('user-invalid', '&:user-invalid');
		}),
	],
	future: { hoverOnlyWhenSupported: true },
} satisfies Config;
