import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAllOfficialPlugins } from './official-plugin-build/build-all.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

await buildAllOfficialPlugins({ root });
