import { PUBLIC_LOCALE } from '$env/static/public';

const en = {
	'http': {
		400: 'Bad Request',
		401: 'Unauthorized',
		403: 'Forbidden',
		500: 'Internal Server Error',
	},
	'go-home': 'Go Home',
	'please-try-again': 'Please try again.',
	'unknown-error': 'Unknown Error',
};

const ko: typeof en = {
	'http': {
		400: '잘못된 요청',
		401: '자격 증명 없음',
		403: '권한 없음',
		500: '내부 서버 오류',
	},
	'go-home': '처음으로',
	'please-try-again': '다시 시도해 주세요.',
	'unknown-error': '알 수 없는 오류',
};

// Vite env variables are statically replaced at build time.
// Unused translations are tree-shaken and not bundled.
// See https://vitejs.dev/guide/env-and-mode
export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
