import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWorkbenchColorsFromTokens } from '@chronos/core/theme/workbench-colors';
import { buildGeneratedThemeCss, buildM3Tokens } from '@chronos/ui-kit/theme/m3-theme';
import { writeIfChanged } from '../build-utils/write-if-changed';

const themeDir = dirname(fileURLToPath(import.meta.url));
const generatedThemePath = resolve(themeDir, 'generated-colors.css');
const generatedWorkbenchPath = fileURLToPath(
	new URL(
		'../../../../../packages/ui-kit/src/theme/m3-default-workbench.generated.ts',
		import.meta.url
	)
);

function writeGeneratedM3DefaultWorkbench(): void {
	const workbench = createWorkbenchColorsFromTokens(buildM3Tokens('light'), buildM3Tokens('dark'));
	writeIfChanged(
		generatedWorkbenchPath,
		`/* generated, do not edit */

export const m3DefaultWorkbenchColors: {
	light: Record<string, string>;
	dark: Record<string, string>;
} = ${JSON.stringify(workbench, null, '\t')};
`
	);
}

export function writeGeneratedThemeCss() {
	writeGeneratedM3DefaultWorkbench();
	writeIfChanged(generatedThemePath, buildGeneratedThemeCss());
	return generatedThemePath;
}
