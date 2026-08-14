import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGeneratedThemeCss } from './scheme';

export { buildGeneratedThemeCss } from './scheme';

const generatedThemePath = resolve(dirname(fileURLToPath(import.meta.url)), 'generated-theme.css');

export function writeGeneratedThemeCss() {
	const css = buildGeneratedThemeCss();
	try {
		const existing = readFileSync(generatedThemePath, 'utf8');
		if (existing === css) {
			return generatedThemePath;
		}
	} catch {
		// File does not exist yet
	}
	writeFileSync(generatedThemePath, css, 'utf8');
	return generatedThemePath;
}
