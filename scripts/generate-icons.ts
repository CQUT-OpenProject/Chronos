import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webStatic = resolve(root, 'apps/web/static');
const pwaDir = resolve(webStatic, 'pwa');
const sourceSvgPath = resolve(webStatic, 'chronos-icon.svg');

const BG = '#f0f4f8';
const BRAND = '#0068B7';
const SOURCE_VIEWBOX = 108;
/** Maskable safe zone: keep artwork inside the central ~80%. */
const MASKABLE_SAFE_RATIO = 0.8;

mkdirSync(pwaDir, { recursive: true });

const sourceSvg = readFileSync(sourceSvgPath, 'utf8');
const sourceInner = extractSvgInner(sourceSvg);

function extractSvgInner(svg: string): string {
	const match = svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg\s*>/i);
	if (!match?.[1]) {
		throw new Error(`Could not parse SVG inner content from ${sourceSvgPath}`);
	}
	return match[1].trim();
}

function renderPng(svg: string, size: number): Buffer {
	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: size
		}
	});
	return Buffer.from(resvg.render().asPng());
}

function writePng(output: string, svg: string, size: number): void {
	writeFileSync(output, renderPng(svg, size));
	console.log(`Wrote ${output} (${size}x${size})`);
}

function anyIconSvg(): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${SOURCE_VIEWBOX}" height="${SOURCE_VIEWBOX}" viewBox="0 0 ${SOURCE_VIEWBOX} ${SOURCE_VIEWBOX}">
${sourceInner}
</svg>`;
}

function paddedIconSvg(canvasSize: number, contentRatio: number, background = BG): string {
	const inner = canvasSize * contentRatio;
	const inset = (canvasSize - inner) / 2;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
	<rect width="${canvasSize}" height="${canvasSize}" fill="${background}" />
	<svg x="${inset}" y="${inset}" width="${inner}" height="${inner}" viewBox="0 0 ${SOURCE_VIEWBOX} ${SOURCE_VIEWBOX}">
${sourceInner}
	</svg>
</svg>`;
}

function screenshotSvg(width: number, height: number): string {
	const iconSize = Math.round(Math.min(width, height) * 0.22);
	const iconX = (width - iconSize) / 2;
	const iconY = height * 0.36 - iconSize / 2;
	const titleY = iconY + iconSize + Math.round(height * 0.06);
	const titleSize = Math.round(Math.min(width, height) * 0.045);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
	<rect width="${width}" height="${height}" fill="${BG}" />
	<svg x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" viewBox="0 0 ${SOURCE_VIEWBOX} ${SOURCE_VIEWBOX}">
${sourceInner}
	</svg>
	<text
		x="${width / 2}"
		y="${titleY}"
		text-anchor="middle"
		dominant-baseline="hanging"
		font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
		font-size="${titleSize}"
		font-weight="700"
		fill="${BRAND}"
	>Chronos</text>
</svg>`;
}

const anySvg = anyIconSvg();
writePng(resolve(webStatic, 'pwa-192.png'), anySvg, 192);
writePng(resolve(webStatic, 'pwa-512.png'), anySvg, 512);

const maskable192 = paddedIconSvg(192, MASKABLE_SAFE_RATIO);
const maskable512 = paddedIconSvg(512, MASKABLE_SAFE_RATIO);
writePng(resolve(webStatic, 'pwa-192-maskable.png'), maskable192, 192);
writePng(resolve(webStatic, 'pwa-512-maskable.png'), maskable512, 512);

// Apple touch icon: mild padding on splash background
writePng(resolve(webStatic, 'apple-touch-icon.png'), paddedIconSvg(180, 0.86), 180);

const narrowW = 1080;
const narrowH = 1920;
const wideW = 1920;
const wideH = 1080;
writeFileSync(
	resolve(pwaDir, 'screenshot-narrow.png'),
	renderPng(screenshotSvg(narrowW, narrowH), narrowW)
);
console.log(`Wrote ${resolve(pwaDir, 'screenshot-narrow.png')} (${narrowW}x${narrowH})`);
writeFileSync(
	resolve(pwaDir, 'screenshot-wide.png'),
	renderPng(screenshotSvg(wideW, wideH), wideW)
);
console.log(`Wrote ${resolve(pwaDir, 'screenshot-wide.png')} (${wideW}x${wideH})`);
