import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitProfileArtifacts } from '../src/lib/profile-codegen/chronos-profile-plugin.ts';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svelteKitBin = path.join(webRoot, 'node_modules/.bin/svelte-kit');

emitProfileArtifacts(webRoot);
execSync(`"${svelteKitBin}" sync`, { cwd: webRoot, stdio: 'inherit' });
