#!/usr/bin/env node

import * as p from '@clack/prompts';
import { exec, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { appendFileSync, cpSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chdir, cwd, exit } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { promisify, styleText } from 'node:util';
import { email, pipe, safeParse, string } from 'valibot';
import pkg from './package.json' with { type: 'json' };

// eslint-disable-next-line no-console
console.clear();

p.intro(styleText(['bgCyan', 'black'], pkg.name));

const project = await p.group(
	{
		relativePath: () =>
			p.text({
				message: 'Where would you like the project to be created?',
				placeholder: './kitty-goes-meow',
				validate: (value) => {
					if (!value) return 'Please enter a path.';
					if (!value.startsWith('./')) return 'Please enter a relative path.';
					const resolvedPath = path.resolve(cwd(), value);
					const directoryIsNotEmpty =
						existsSync(resolvedPath) && //
						readdirSync(resolvedPath).length;
					if (directoryIsNotEmpty) return 'Provided directory is not empty.';
				}
			}),
		rootAdminContact: () =>
			p.text({
				message: `What is the root administrator's email address?`,
				placeholder: 'username@example.com',
				validate: (value) => {
					const parsedEmail = safeParse(pipe(string(), email()), value);
					if (!parsedEmail.success) return 'Please enter a valid email.';
				}
			}),
		emailProvider: () =>
			p.select({
				message: 'Which email provider would you like to use?',
				options: [{ value: 'postmark', label: 'Postmark' }]
				// TODO Implement other email providers.
			}),
		packageManager: () =>
			p.select({
				message: 'Which package manager would you like to use?',
				options: [
					{ value: 'npm' }, //
					{ value: 'pnpm' },
					{ value: 'bun' }
				]
			})
	},
	{
		onCancel: () => {
			p.cancel('Operation cancelled.');
			exit(0);
		}
	}
);

// Reference https://github.com/bombshell-dev/clack/issues/172
const execAsync = promisify(exec);

const env = `
ROOT_ADMIN_CONTACT="${project.rootAdminContact}"

EMAIL_API_KEY="" # ${project.emailProvider}
EMAIL_SENDER=""

JWT_SECRET="${randomBytes(32).toString('base64')}"`.trim();

await p.tasks([
	{
		title: 'Copying template',
		task: async () => {
			const timer = setTimeout(1000);
			const resolvedPath = path.resolve(cwd(), project.relativePath);
			cpSync(import.meta.dirname + '/template', resolvedPath, { recursive: true });
			chdir(resolvedPath); // NOTE CWD is now the project directory.
			writeFileSync('.env.local', env);
			appendFileSync('svelte.config.js', `\n// created with ${pkg.name}@${pkg.version}\n`);
			await timer;
			return 'Successfully copied template';
		}
	},
	{
		title: 'Installing dependencies',
		task: async () => {
			await execAsync(`${project.packageManager} install`);
			return 'Successfully installed dependencies';
		}
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
		}
	}
]);

const nextSteps = `
cd ${project.relativePath}
node --run dev
# ${project.packageManager} run dev

[ ] review and backup file: .env.local
[ ] login as the root user: ${project.rootAdminContact}`.trim();

p.note(nextSteps, 'Next steps:');

p.log.success(`You're all set!`);
p.outro(`Reference ${styleText(['underline', 'cyan'], pkg.homepage)}`);