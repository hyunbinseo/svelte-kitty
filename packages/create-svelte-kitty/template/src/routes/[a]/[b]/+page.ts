// src\routes\[a]\[b]\+page.ts

import { parseOrErrorPage } from '$lib/utilities.ts';
import { object, string } from 'valibot';

export const load = ({ params: _params }) => {
	// Argument of type 'ObjectSchema<{ readonly a: StringSchema<undefined>; }, undefined>'
	// is not assignable to parameter of type 'GenericSchema<RouteParams, unknown>'.
	// Property 'b' is missing in type '{ a: string; }' but required in type 'RouteParams'. ts(2345)
	const params = parseOrErrorPage(object({ a: string() }), _params);
};
