import { existsSync } from 'node:fs';
import { argv, exit } from 'node:process';
import { array, picklist, pipe, safeParse, startsWith, string, transform } from 'valibot';
import { build } from './scripts/build.js';
import { send } from './scripts/send.js';

if (!existsSync('svelte.config.js')) {
	console.error('svelte.config.js not found in this directory.');
	exit(1);
}

const validCommands = /** @type {const} */ (['build']);
const validFlags = /** @type {const} */ (['send', 'dry-run']);

const FlagSchema = pipe(
	array(
		pipe(
			string(),
			startsWith('--'),
			transform((v) => v.substring(2)),
			picklist(validFlags),
		),
	),
	transform((arr) => new Set(arr)),
);

const parsedCommand = safeParse(picklist(validCommands), argv[2]);
const parsedFlags = safeParse(FlagSchema, argv.slice(3));

if (!parsedCommand.success || !parsedFlags.success) {
	console.error('Invalid command. Available:\n');
	console.error(`commands: ${validCommands.join(', ')}`);
	console.error(`   flags: --${validFlags.join(', --')}`);
	exit(1);
}

const command = parsedCommand.output;
const flags = parsedFlags.output;

if (command === 'build') {
	const { buildId } = await build();
	if (flags.has('send')) await send({ buildId, isDryRun: flags.has('dry-run') });
	exit();
}
