import { PUBLIC_LOCALE } from '$env/static/public';

const en = {
	nav: {
		admin: 'Admin',
		dashboard: 'Dashboard',
		home: 'Home',
		logout: 'Logout',
		roles: 'Roles',
		users: 'Users',
	},
	logo: 'Logo',
};

const ko: typeof en = {
	nav: {
		admin: '관리',
		dashboard: '대시보드',
		home: '홈',
		logout: '로그아웃',
		roles: '역할',
		users: '사용자',
	},
	logo: '로고',
};

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
