import { parseOrErrorPage } from '$lib/utilities.ts';
import { object, string } from 'valibot';

parseOrErrorPage(
	object({ a: string() }), // okay, key 'a' exists in the input, 'b' is optional
	{ a: 'text', b: 1 },
);

parseOrErrorPage(
	object({ a: string(), c: string() }), // not-okay, key 'c' does not exist in the input
	// Object literal may only specify known properties, and 'b' does not exist in type '{ a: string; c: string; }'.ts(2353)
	{ a: 'text', b: 1 },
);
