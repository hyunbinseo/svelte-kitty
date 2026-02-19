import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd, env } from 'node:process';
import { build } from 'vite';

const outDir = `build/${Math.floor(Date.now() / 1000)}`;

if (!existsSync(resolve(cwd(), 'package.json'))) throw new Error();
if (existsSync(resolve(cwd(), `./${outDir}`))) throw new Error();

env.SVELTE_KIT_NODE_ADAPTER_OUT = outDir;
await build();

// eslint-disable-next-line no-console
console.table({ outDir });
