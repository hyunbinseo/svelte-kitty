import { PUBLIC_LOCALE } from '$env/static/public';

const en = { pageTitle: 'Home' };

const ko: typeof en = { pageTitle: '홈' };

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
