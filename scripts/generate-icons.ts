import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceSvg = resolve(root, 'static/chronos-icon.svg');

const targets = [
	{ size: 192, output: resolve(root, 'static/pwa-192.png') },
	{ size: 512, output: resolve(root, 'static/pwa-512.png') }
] as const;

const svg = readFileSync(sourceSvg, 'utf8');

for (const { size, output } of targets) {
	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: size
		}
	});
	const png = resvg.render().asPng();
	writeFileSync(output, png);
	console.log(`Wrote ${output} (${size}x${size})`);
}
