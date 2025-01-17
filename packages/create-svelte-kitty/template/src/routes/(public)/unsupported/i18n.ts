import { PUBLIC_LOCALE } from '$env/static/public';

const en = {
	pageTitle: 'Unsupported Browser',
	heading: 'Browser is not supported.',
	message: 'Please use the latest browser for security and compatibility.'
};

const ko: typeof en = {
	pageTitle: '지원되지 않는 브라우저',
	heading: '지원되지 않는 브라우저입니다.',
	message: '보안 업데이트가 제공되는 최신 브라우저로 접속해 주세요.'
};

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
