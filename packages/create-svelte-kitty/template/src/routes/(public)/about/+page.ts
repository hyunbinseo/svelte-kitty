import type { PageLoad } from './$types';
import { t } from './i18n';

export const prerender = true;

export const load = (() => ({ pageTitle: t.pageTitle })) satisfies PageLoad;
