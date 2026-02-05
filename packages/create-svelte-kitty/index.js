#!/usr/bin/env node

import * as p from '@clack/prompts';
import { exec, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { appendFileSync, cpSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chdir, cwd, exit } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { promisify, styleText } from 'node:util';
import { email, pipe, safeParse, string } from 'valibot';
import pkg from './package.json' with { type: 'json' };

// NOTE The template's package.json only includes a "name" field because:
// - @changesets/cli requires package.json files to include a "name" field.
// - @changesets/cli ignores package.json files without a "version" field.

// eslint-disable-next-line no-console
console.clear();

p.intro(styleText(['bgCyan', 'black'], `${pkg.name}@${pkg.version}`));

const project = await p.group(
	{
		relativePath: () =>
			p.text({
				message: 'Where would you like the project to be created?',
				placeholder: './kitty-goes-meow',
				validate: (value) => {
					if (!value) return 'Please enter a path.';
					if (!value.startsWith('./')) return 'Please enter a relative path.';
					const resolvedPath = resolve(cwd(), value);
					const directoryIsNotEmpty =
						existsSync(resolvedPath) && //
						readdirSync(resolvedPath).length;
					if (directoryIsNotEmpty) return 'Provided directory is not empty.';
					return;
				},
			}),
		rootAdminContact: () =>
			p.text({
				message: `What is the root administrator's email address?`,
				placeholder: 'username@example.com',
				validate: (value) => {
					const parsedEmail = safeParse(pipe(string(), email()), value);
					if (!parsedEmail.success) return 'Please enter a valid email.';
					return;
				},
			}),
		emailProvider: () =>
			p.select({
				message: 'Which email provider would you like to use?',
				options: [{ value: 'postmark', label: 'Postmark' }],
				// TODO Implement other email providers.
			}),
		packageManager: () =>
			p.select({
				message: 'Which package manager would you like to use?',
				options: [
					{ value: 'npm' }, //
					{ value: 'pnpm' },
					{ value: 'bun' },
				],
			}),
	},
	{
		onCancel: () => {
			p.cancel('Operation cancelled.');
			exit(0);
		},
	},
);

/** @param {'development' | 'production'} filename  */
const generateEnv = (filename) =>
	`# DO NOT COMMIT THIS FILE TO SOURCE CONTROL

${
	filename === 'development'
		? '# Loaded in `vite dev`' //
		: '# Loaded in `vite preview`\n# Also loaded in the `build/start.js` file.'
}
# See https://vite.dev/guide/env-and-mode

# By importing these secrets using the \`$env/dynamic/private\` module,
# the environment variable can be updated without rebuilding the app.
# See https://svelte.dev/docs/kit/$env-dynamic-private

ROOT_ADMIN_CONTACT="${project.rootAdminContact}"

EMAIL_SENDER=""
EMAIL_API_KEY=""

JWT_SECRET_CURRENT="${randomBytes(32).toString('base64')}"
JWT_SECRET_EXPIRED=""
`;

// See https://github.com/bombshell-dev/clack/issues/172
const execAsync = promisify(exec);

await p.tasks([
	{
		title: 'Copying template',
		task: async () => {
			const timer = setTimeout(1000);
			const resolvedPath = resolve(cwd(), project.relativePath);
			cpSync(join(import.meta.dirname, 'template'), resolvedPath, { recursive: true });
			chdir(resolvedPath); // NOTE CWD is now the project directory.
			appendFileSync('svelte.config.js', `\n// created with ${pkg.name}@${pkg.version}\n`);
			writeFileSync('.env.development.local', generateEnv('development'));
			writeFileSync('.env.production.local', generateEnv('production'));
			writeFileSync(
				'.env.local',
				`# DO NOT COMMIT THIS FILE TO SOURCE CONTROL

SERVER_ADDRESS="" # IP address or the Tailscale machine name
SERVER_USERNAME="webadmin"
SERVER_DIRECTORY="server"
`,
			);
			if (project.packageManager === 'pnpm') {
				// Requires `pnpm@10.5+` but the pnpm version is not checked.
				// See https://github.com/pnpm/pnpm/releases/tag/v10.5.0
				writeFileSync(
					'pnpm-workspace.yaml',
					`onlyBuiltDependencies:
  - better-sqlite3
  - esbuild\n`,
				);
			}
			await timer;
			return 'Successfully copied template';
		},
	},
	{
		title: 'Installing dependencies',
		task: async () => {
			await execAsync(`${project.packageManager} install`);
			return 'Successfully installed dependencies';
		},
	},
	{
		title: 'Initializing project',
		task: async () => {
			const timer = setTimeout(1000);

			await execAsync('node --run db:generate');
			await execAsync('node --run db:migrate');

			const gitIsAvailable = !spawnSync('git', ['--version']).error;
			if (gitIsAvailable) {
				await execAsync('git init');
				await execAsync('git add .');
				const projectName = pkg.name.replace('create-', '');
				await execAsync(`git commit -m "chore: initialize ${projectName}"`);
			}

			await timer;
			return 'Successfully initialized project';
		},
	},
]);

const nextSteps = `
cd ${project.relativePath}
node --run dev
# ${project.packageManager} run dev

[ ] review and backup generated *.local environment files
[ ] login as the root administrator: ${project.rootAdminContact}`.trim();

// [ ] review and backup generated *.local environment files
// [ ] login as the root administrator: username@example.com

p.note(nextSteps, 'Next steps:');

p.log.success(`You're all set!`);
p.outro(`See ${styleText(['underline', 'cyan'], pkg.homepage)}`);
