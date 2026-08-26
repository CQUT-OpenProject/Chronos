import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emitProfileArtifacts } from '../src/lib/profile-codegen/chronos-profile-plugin.ts';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
emitProfileArtifacts(webRoot);
