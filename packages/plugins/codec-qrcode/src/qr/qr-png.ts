import { generateQrMatrix, type QrMatrix } from './qr-encode';

const PNG_SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[i] = c;
	}
	return table;
})();

function crc32(bytes: Uint8Array): number {
	let crc = 0xffffffff;
	for (let i = 0; i < bytes.length; i++) {
		crc = CRC_TABLE[(crc ^ bytes[i]!) & 0xff]! ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function writeU32BE(view: DataView, offset: number, value: number): void {
	view.setUint32(offset, value, false);
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
	const typeBytes = new TextEncoder().encode(type);
	const chunk = new Uint8Array(4 + 4 + data.length + 4);
	const view = new DataView(chunk.buffer);
	writeU32BE(view, 0, data.length);
	chunk.set(typeBytes, 4);
	chunk.set(data, 8);
	const crcInput = new Uint8Array(typeBytes.length + data.length);
	crcInput.set(typeBytes, 0);
	crcInput.set(data, typeBytes.length);
	writeU32BE(view, 8 + data.length, crc32(crcInput));
	return chunk;
}

function pngTextChunk(keyword: string, text: string): Uint8Array {
	const keywordBytes = new TextEncoder().encode(keyword);
	const textBytes = new TextEncoder().encode(text);
	const data = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
	data.set(keywordBytes, 0);
	data[keywordBytes.length] = 0;
	data.set(textBytes, keywordBytes.length + 1);
	return pngChunk('tEXt', data);
}

async function zlibDeflate(bytes: Uint8Array): Promise<Uint8Array> {
	if (typeof CompressionStream === 'undefined') {
		const specifier = ['node', 'zlib'].join(':');
		const zlib = (await import(/* @vite-ignore */ specifier)) as {
			deflateSync: (data: Uint8Array) => Uint8Array;
		};
		return new Uint8Array(zlib.deflateSync(bytes));
	}
	const input = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(bytes);
			controller.close();
		}
	});
	const output = input.pipeThrough(
		new CompressionStream('deflate') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>
	);
	return new Uint8Array(await new Response(output).arrayBuffer());
}

export interface RasterizeQrOptions {
	margin?: number;
	size?: number;
}

export function rasterizeQrMatrix(
	matrix: QrMatrix,
	options: RasterizeQrOptions = {}
): { rgba: Uint8Array; width: number; height: number } {
	const { margin = 2, size = 512 } = options;
	const moduleCount = matrix.size + margin * 2;
	const scale = Math.max(1, Math.floor(size / moduleCount));
	const width = moduleCount * scale;
	const height = moduleCount * scale;
	const rgba = new Uint8Array(width * height * 4);

	for (let y = 0; y < height; y++) {
		const moduleRow = Math.floor(y / scale) - margin;
		for (let x = 0; x < width; x++) {
			const moduleCol = Math.floor(x / scale) - margin;
			const isDark =
				moduleRow >= 0 &&
				moduleRow < matrix.size &&
				moduleCol >= 0 &&
				moduleCol < matrix.size &&
				matrix.modules[moduleRow]![moduleCol]!;
			const offset = (y * width + x) * 4;
			const value = isDark ? 0 : 255;
			rgba[offset] = value;
			rgba[offset + 1] = value;
			rgba[offset + 2] = value;
			rgba[offset + 3] = 255;
		}
	}

	return { rgba, width, height };
}

export async function encodeRgbaAsPng(
	rgba: Uint8Array,
	width: number,
	height: number,
	options: { metadata?: string } = {}
): Promise<Uint8Array> {
	const rowSize = 1 + width * 4;
	const raw = new Uint8Array(height * rowSize);
	for (let y = 0; y < height; y++) {
		const rowStart = y * rowSize;
		raw[rowStart] = 0;
		raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), rowStart + 1);
	}

	const compressed = await zlibDeflate(raw);

	const ihdr = new Uint8Array(13);
	const ihdrView = new DataView(ihdr.buffer);
	writeU32BE(ihdrView, 0, width);
	writeU32BE(ihdrView, 4, height);
	ihdr[8] = 8;
	ihdr[9] = 6;
	ihdr[10] = 0;
	ihdr[11] = 0;
	ihdr[12] = 0;

	const parts = [
		PNG_SIGNATURE,
		pngChunk('IHDR', ihdr),
		pngChunk('IDAT', compressed),
		...(options.metadata ? [pngTextChunk('chronos-qr', options.metadata)] : []),
		pngChunk('IEND', new Uint8Array(0))
	];
	const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
	const png = new Uint8Array(totalLength);
	let offset = 0;
	for (const part of parts) {
		png.set(part, offset);
		offset += part.length;
	}
	return png;
}

export interface GenerateQrPngOptions extends RasterizeQrOptions {
	margin?: number;
	size?: number;
}

export async function generateQrPng(
	text: string,
	options: GenerateQrPngOptions = {}
): Promise<Uint8Array> {
	const matrix = generateQrMatrix(text);
	const { rgba, width, height } = rasterizeQrMatrix(matrix, options);
	return encodeRgbaAsPng(rgba, width, height, { metadata: text });
}
