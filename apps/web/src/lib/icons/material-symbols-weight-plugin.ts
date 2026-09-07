import type { Plugin } from 'vite';

const WEIGHT_400 = /"400":\s*("(?:\\.|[^"\\])*")/g;

export function stripMaterialSymbolIconWeights(code: string): string | null {
	const start = code.indexOf('const pathData = ');
	const end = code.indexOf('\nconst metadata', start);
	if (start < 0 || end < 0) return null;

	const quoted = [...code.slice(start, end).matchAll(WEIGHT_400)].map((match) => match[1]);
	if (quoted.length === 0 || quoted[0] === undefined) return null;

	const regular = quoted[0];
	const filled = quoted[1];
	const pathData = filled
		? `const pathData = {\n    regular: {\n        "400": ${regular}\n    },\n    filled: {\n        "400": ${filled}\n    }\n};`
		: `const pathData = {\n    regular: {\n        "400": ${regular}\n    }\n};`;

	return `${code.slice(0, start)}${pathData}${code.slice(end)}`;
}

export function materialSymbolsWeightPlugin(): Plugin {
	return {
		name: 'chronos-material-symbols-weight',
		enforce: 'pre',
		transform(code, id) {
			const modulePath = id.split('?')[0]!.replaceAll('\\', '/');
			if (
				!modulePath.includes('@material-symbols-svg/svelte/') ||
				!/\/icons\/[^/]+\.js$/.test(modulePath)
			) {
				return;
			}
			const next = stripMaterialSymbolIconWeights(code);
			if (!next) return;
			return { code: next, map: null };
		}
	};
}
