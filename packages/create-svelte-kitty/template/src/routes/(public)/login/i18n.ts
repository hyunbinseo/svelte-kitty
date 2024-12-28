import { PUBLIC_SITE_NAME } from '$env/static/public';

const en = {
	'pageTitle': 'Login',
	'code': 'Code',
	'continue': 'Continue',
	'email': 'Email',
	'login-as': 'Login as:',
	'login': 'Login',
	'magic-link-is-invalid': 'Magic link is invalid.',
	'please-check-your-inbox': 'Please check your inbox.',
	'send-magic-link': 'Send Magic Link',
	'start-over': 'Start Over',
	'this-page-can-be-safely-closed': 'This page can be safely closed.',
	'use-verification-code': 'Use Verification Code',
	'template': (magicLink: URL, otp: string) => ({
		Subject: `Login to ${PUBLIC_SITE_NAME}`,
		HtmlBody: `<a href="${magicLink.toString()}">Login from this device</a> or use verification code ${otp}`
	}),
	'error': {
		LOGIN_EXPIRED: 'Login attempt expired.',
		LOGIN_PENDING: 'Use existing link first.',
		OTP_INVALID: 'Incorrect code.',
		SEND_FAILED: 'Failed to send. Please try again later.'
	}
};

const ko: typeof en = {
	'pageTitle': '로그인',
	'code': '인증번호',
	'continue': '계속하기',
	'email': '이메일',
	'login-as': '다음 정보로 로그인:',
	'login': '로그인',
	'magic-link-is-invalid': '잘못된 인증 링크입니다.',
	'please-check-your-inbox': '메일함을 확인해 주세요.',
	'send-magic-link': '인증 링크 전송',
	'start-over': '다시 시도하기',
	'this-page-can-be-safely-closed': '이 페이지는 닫으셔도 됩니다.',
	'use-verification-code': '인증번호 사용',
	'template': (magicLink: URL, otp: string) => ({
		Subject: `${PUBLIC_SITE_NAME} 로그인`,
		HtmlBody: `<a href="${magicLink.toString()}">이 기기에서 로그인</a>하거나 인증번호 [${otp}]를 입력하세요.`
	}),
	'error': {
		LOGIN_EXPIRED: '로그인 시도가 만료되었습니다.',
		LOGIN_PENDING: '기존 링크를 먼저 사용하세요.',
		OTP_INVALID: '잘못된 인증번호입니다.',
		SEND_FAILED: '발송하지 못했습니다. 나중에 다시 시도해 주세요.'
	}
};

export const t = import.meta.env.VITE_LOCALE === 'ko' ? ko : en;
