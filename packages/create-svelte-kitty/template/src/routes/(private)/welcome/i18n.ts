import { PUBLIC_LOCALE } from '$env/static/public';

const en = {
	'pageTitle': 'Welcome',
	'doe': 'Doe',
	'get-started': 'Get Started',
	'given-name': 'Given Name',
	'john': 'John',
	'surname': 'Surname',
	'tell-us-about-yourself': 'Tell us about yourself',
	'welcome': 'Welcome!',
};

const ko: typeof en = {
	'pageTitle': '회원정보 입력',
	'doe': '홍',
	'get-started': '시작하기',
	'given-name': '이름',
	'john': '길동',
	'surname': '성',
	'tell-us-about-yourself': '회원정보를 입력해 주세요.',
	'welcome': '반갑습니다!',
};

export const t = PUBLIC_LOCALE === 'ko' ? ko : en;
