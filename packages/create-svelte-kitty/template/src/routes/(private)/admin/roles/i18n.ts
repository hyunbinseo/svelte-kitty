import { PUBLIC_LOCALE } from '$env/static/public';

const en = {
	'pageTitle': 'Manage Roles',
	'admin': 'Admin',
	'assign-new-role': 'Assign New Role',
	'assign-role': 'Assign Role',
	'close': 'Close',
	'contact': 'Contact',
	'given-name': 'Given Name',
	'go-back': 'Go Back',
	'john': 'John',
	'name': 'Name',
	'new-role': 'New Role',
	'no-data-to-show': 'No data to show.',
	'no-search-results': 'No search results',
	'role-has-been-assigned': 'Role has been assigned.',
	'role': 'Role',
	'search-user': 'Search User',
	'search': 'Search',
	'start-over': 'Start Over',
	'superuser': 'Superuser',
	'user': 'User',
};

const ko: typeof en = {
	'pageTitle': '역할 관리',
	'admin': '관리자',
	'assign-new-role': '신규 역할 부여',
	'assign-role': '역할 부여',
	'close': '닫기',
	'contact': '연락처',
	'given-name': '이름만 (성 제외)',
	'go-back': '돌아가기',
	'john': '길동',
	'name': '이름',
	'new-role': '신규 역할',
	'no-data-to-show': '표시할 정보가 없습니다.',
	'no-search-results': '검색 결과가 없습니다.',
	'role-has-been-assigned': '신규 역할을 부여했습니다.',
	'role': '역할',
	'search-user': '사용자 찾기',
	'search': '검색',
	'start-over': '처음으로',
	'superuser': '슈퍼 관리자',
	'user': '사용자',
};

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
