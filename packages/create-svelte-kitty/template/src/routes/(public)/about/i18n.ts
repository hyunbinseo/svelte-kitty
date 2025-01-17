import { PUBLIC_LOCALE } from '$env/static/public';

const en = { pageTitle: 'About' };

const ko: typeof en = { pageTitle: '소개' };

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
