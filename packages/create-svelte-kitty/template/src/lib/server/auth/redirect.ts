import type { ResolvedPathname } from '$app/types';

const REDIRECT_PARAM = 'redirect';

export const createRedirectUrl = (pathname: ResolvedPathname, currentUrl: URL) => {
	const url = new URL(pathname, currentUrl);
	url.search = '';
	url.searchParams.set(REDIRECT_PARAM, currentUrl.pathname + currentUrl.search);
	return url;
};

export const getRedirectUrl = (currentUrl: URL) => {
	const destination = currentUrl.searchParams.get(REDIRECT_PARAM);
	if (!destination) return;

	const url = new URL(destination, currentUrl);

	// e.g. new URL('//evil.com', 'https://example.com')
	if (url.origin !== currentUrl.origin) return;
	if (url.pathname === currentUrl.pathname) return;

	return url;
};
