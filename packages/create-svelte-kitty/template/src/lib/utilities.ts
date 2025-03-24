import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { safeParse, type GenericSchema } from 'valibot';

export function parseOrErrorPage<TInput, TSchema extends GenericSchema<TInput, unknown>>(
	schema: TSchema,
	input: TInput,
	status = 400,
) {
	const result = safeParse(schema, input);
	if (!result.success) {
		// eslint-disable-next-line no-console
		if (dev) console.log(result.issues);
		error(status);
	}
	return result.output;
}

export const base64ToUint8Array = (base64: string) =>
	Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
