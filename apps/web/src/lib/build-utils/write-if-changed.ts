import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Writes contents to the target path only if the file does not exist or its
 * current contents differ from the new content, avoiding unnecessary mtime updates.
 *
 * Used by build-time codegen (theme CSS, license manifests), not request handlers.
 */
export function writeIfChanged(path: string, contents: string): void {
	try {
		if (readFileSync(path, 'utf8') === contents) return;
	} catch {
		// File does not exist yet
	}
	writeFileSync(path, contents, 'utf8');
}
