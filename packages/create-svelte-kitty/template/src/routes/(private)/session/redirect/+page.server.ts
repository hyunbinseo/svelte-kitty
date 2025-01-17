import { PUBLIC_PRIVATE_PATH } from '$env/static/public';
import { redirect } from '@sveltejs/kit';

export const load = ({ locals }) => {
	redirect(302, locals.session ? PUBLIC_PRIVATE_PATH : '/login');
};