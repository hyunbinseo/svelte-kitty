import { PUBLIC_LOCALE } from '$env/static/public';

const en = {
	'pageTitle': 'Manage Users',
	'active-users': 'Active Users',
	'contact': 'Contact',
	'deactivate': 'Deactivate',
	'deactivated-at': 'Deactivated At',
	'joined-at': 'Joined At',
	'name': 'Name',
	'reset': 'Reset',
};

const ko: typeof en = {
	'pageTitle': '사용자 관리',
	'active-users': '활성 사용자',
	'contact': '연락처',
	'deactivate': '비활성화',
	'deactivated-at': '비활성화 일자',
	'joined-at': '가입일자',
	'name': '이름',
	'reset': '선택 해제',
};

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
