import { PUBLIC_LOCALE } from '$env/static/public';

const en = {
	'noscript': 'JavaScript is not available. Enable it or switch to a supported browser.',
	'skip-to-content': 'Skip to content'
};

const ko: typeof en = {
	'noscript':
		'자바스크립트를 사용할 수 없습니다. 이를 활성화하거나, 지원되는 브라우저로 접속해 주세요.',
	'skip-to-content': '본문 바로가기'
};

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
