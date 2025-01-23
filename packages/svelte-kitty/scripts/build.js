import { writeFileSync } from 'node:fs';
import { env } from 'node:process';
import { build as viteBuild } from 'vite';

export const build = async () => {
	const buildId = Date.now().toString();

	env.BUILD_ID = buildId;
	await viteBuild();

	writeFileSync(
		'build/start.js',
		`// THIS FILE IS GENERATED ON BUILD

import { loadEnvFile } from 'node:process';

loadEnvFile('.env.production');

await import('./${buildId}/index.js');
`,
	);

	return { buildId };
};
