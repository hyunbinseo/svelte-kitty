import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { exit } from 'node:process';
import { parseEnv, styleText } from 'node:util';
import { object, pipe, safeParse, string, transform } from 'valibot';
import pkg from '../package.json' with { type: 'json' };

/** @param {{ buildId: string; isDryRun: boolean }} param0 */
export const send = async ({ buildId, isDryRun }) => {
	const rsyncIsAvailable = !spawnSync('rsync', ['--version']).error;

	if (!rsyncIsAvailable) {
		console.error('rsync command not found. Is it installed in the system?');
		exit(1);
	}

	if (!existsSync('.env.local')) {
		console.error('.env.local not found in this directory.');
		exit(1);
	}

	const parsedServer = safeParse(
		pipe(
			object({
				SERVER_ADDRESS: string(),
				SERVER_USERNAME: string(),
				SERVER_DIRECTORY: string(),
			}),
			transform((v) => ({
				address: v.SERVER_ADDRESS,
				username: v.SERVER_USERNAME,
				directory: v.SERVER_DIRECTORY,
			})),
		),
		parseEnv(readFileSync('.env.local', 'utf8')),
	);

	if (!parsedServer.success) {
		console.error('.env.local has invalid server configuration.');
		exit(1);
	}

	const server = parsedServer.output;

	writeFileSync(
		'build/rsync.txt',
		`
- .DS_Store
- Thumbs.db
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
+ /.env.production.local
+ /.node-version
+ /drizzle.production.ts
+ /package.json
+ /pm2.config.cjs
- *
`,
	);

	// eslint-disable-next-line no-console
	console.log(
		'\n' + styleText('cyan', (isDryRun ? '[DRY-RUN] ' : '') + 'Transferring files using rsync:'),
	);

	execSync(
		// To give new files the destination-default permissions (while leaving existing files unchanged),
		// make sure that the --perms option is off and use --chmod=ugo=rwX (which ensures that all non-masked bits get enabled).
		`rsync ${isDryRun ? '-rtvn' : '-rtv'} --chmod=ugo=rwX --include-from=build/rsync.txt ./ ${server.username}@${server.address}:${server.directory}`,
		{ stdio: 'inherit' },
	);

	if (isDryRun) return;

	// eslint-disable-next-line no-console
	console.log(`
${styleText('cyan', 'Next steps:')}
ssh ${server.username}@${server.address}
pm2 restart server

${styleText('cyan', 'For initial deployment, reference:')}
${pkg.homepage}
`);
};
