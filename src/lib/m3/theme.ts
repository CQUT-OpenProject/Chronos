import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGeneratedThemeCss } from '../../../packages/ui-kit/src/theme/m3-theme';

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
