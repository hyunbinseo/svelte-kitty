const en = { pageTitle: 'Admin Dashboard' };

const ko: typeof en = { pageTitle: '관리자 대시보드' };

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
