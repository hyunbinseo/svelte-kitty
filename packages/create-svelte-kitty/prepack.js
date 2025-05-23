import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pkg from '../svelte-kitty/package.json' with { type: 'json' };

const file = join(import.meta.dirname, 'template/package.json');

writeFileSync(
	file,
	readFileSync(file, 'utf8').replace(
		'"svelte-kitty": "workspace:^"', //
		`"svelte-kitty": "^${pkg.version}"`,
	),
);
