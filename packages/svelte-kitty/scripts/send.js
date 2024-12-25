import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { exit } from 'node:process';
import { parseEnv, styleText } from 'node:util';
import { ip, object, pipe, safeParse, string, transform } from 'valibot';
import pkg from '../package.json' with { type: 'json' };

/** @param {{ buildId: string; isDryRun: boolean }} param0 */
export const send = async ({ buildId, isDryRun }) => {
	const rsyncIsAvailable = !spawnSync('rsync', ['--version']).error;

	if (!rsyncIsAvailable) {
		console.error('rsync command not found. Is it installed in the system?');
		exit(1);
	}

	if (!existsSync('.env.production.local')) {
		console.error('.env.production.local not found in this directory.');
		exit(1);
	}

	const productionLocalEnv = parseEnv(readFileSync('.env.production.local', 'utf8'));
	const envHasEmptyValues = Object.values(productionLocalEnv).some((value) => value === '');

	if (envHasEmptyValues) {
		console.error('.env.production.local should not contain empty values.');
		exit(1);
	}

	const parsedServer = safeParse(
		pipe(
			object({
				SERVER_ADDRESS: pipe(string(), ip()),
				SERVER_USERNAME: string(),
				SERVER_DIRECTORY: string()
			}),
			transform((v) => ({
				address: v.SERVER_ADDRESS,
				username: v.SERVER_USERNAME,
				directory: v.SERVER_DIRECTORY
			}))
		),
		productionLocalEnv
	);

	if (!parsedServer.success) {
		console.error('.env.production.local has invalid server configuration.');
		exit(1);
	}

	const server = parsedServer.output;

	writeFileSync(
		'build/rsync.txt',
		`
- *.db
- *.db-shm
- *.db-wal
- *.sqlite
- *.sqlite-shm
- *.sqlite-wal
+ /build/
+ /build/${buildId}/client/_app/***
- /build/${buildId}/client/*
+ /build/${buildId}/***
+ /build/start.js
+ /db/***
+ /drizzle/***
+ /src/
+ /src/lib/
+ /src/lib/server/
+ /src/lib/server/db/***
+ /static/***
+ /.env.production
+ /.node-version
+ /drizzle.production.ts
+ /package.json
+ /pm2.config.cjs
- *
`
	);

	/* eslint-disable no-console */

	console.log(
		styleText(
			'cyan',
			'\n' +
				(isDryRun ? '[DRY-RUN]\n' : '') + //
				'Transferring files using rsync over SSH:'
		)
	);
	console.log('Tap the security key if 2FA is required.');

	const flags = isDryRun ? '-auvn' : '-au';

	execSync(
		`rsync ${flags} --include-from=build/rsync.txt ./ ${server.username}@${server.address}:${server.directory}`,
		{ stdio: 'inherit' }
	);

	if (isDryRun) return;

	console.log(`
${styleText('cyan', 'Next steps:')}
ssh ${server.username}@${server.address}
pm2 restart server

${styleText('cyan', 'For initial deployment, reference:')}
${pkg.homepage}
`);
};
