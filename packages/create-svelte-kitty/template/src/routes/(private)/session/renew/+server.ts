import { authenticate, banCurrentSession } from '$lib/server/authentication';
import { sessionRenewalThreshold } from '$lib/server/db/config';

export const POST = async (e) => {
	if (!e.locals.session) return new Response(null, { status: 401 });

	if (e.locals.session.expiresAt.valueOf() - Date.now() > sessionRenewalThreshold)
		return new Response(null, { status: 400 });

	const { userId } = e.locals.session;

	await banCurrentSession(e, e.locals.session, { delay: true });
	await authenticate(e, userId, null);
	return new Response();
};
