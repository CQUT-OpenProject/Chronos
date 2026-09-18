import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitProfileArtifacts } from '../src/lib/profile-codegen/chronos-profile-plugin.ts';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svelteKitBin = path.join(webRoot, 'node_modules/.bin/svelte-kit');
const paraglideBin = path.join(webRoot, 'node_modules/@inlang/paraglide-js/bin/run.js');

emitProfileArtifacts(webRoot);
execSync(
	`node "${paraglideBin}" compile --project ./project.inlang --outdir ./src/lib/paraglide --emit-ts-declarations`,
	{
		cwd: webRoot,
		stdio: 'inherit'
	}
);
execSync(`"${svelteKitBin}" sync`, { cwd: webRoot, stdio: 'inherit' });
