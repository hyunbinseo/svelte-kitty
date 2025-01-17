import { PUBLIC_LOCALE } from '$env/static/public';

const en = { pageTitle: 'Admin Dashboard' };

const ko: typeof en = { pageTitle: '관리자 대시보드' };

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
