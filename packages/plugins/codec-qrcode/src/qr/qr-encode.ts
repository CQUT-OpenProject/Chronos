/**
 * Complete, self-contained, pure TypeScript QR Code generator (ISO/IEC 18004).
 * Supports Version 1 to 40 (up to 2953 bytes) with full ECC block interleaving and SVG output.
 */

interface EccBlock {
	count: number;
	totalCodewords: number;
	dataCodewords: number;
}

interface VersionEccSpec {
	eccPerBlock: number;
	blocks: EccBlock[];
}

// Galois field tables for GF(256) with prime polynomial 0x11D (285)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(() => {
	let val = 1;
	for (let i = 0; i < 255; i++) {
		GF_EXP[i] = val;
		GF_EXP[i + 255] = val;
		GF_LOG[val] = i;
		val <<= 1;
		if (val & 0x100) val ^= 0x11d;
	}
})();

function gfMul(x: number, y: number): number {
	if (x === 0 || y === 0) return 0;
	return GF_EXP[GF_LOG[x]! + GF_LOG[y]!]!;
}

function rsGeneratorPoly(degree: number): Uint8Array {
	let poly = new Uint8Array([1]);
	for (let i = 0; i < degree; i++) {
		const next = new Uint8Array(poly.length + 1);
		for (let j = 0; j < poly.length; j++) {
			next[j] ^= gfMul(poly[j]!, GF_EXP[i]!);
			next[j + 1] ^= poly[j]!;
		}
		poly = next;
	}
	return poly;
}

function rsComputeEcc(data: Uint8Array, eccLen: number): Uint8Array {
	const gen = rsGeneratorPoly(eccLen);
	const res = new Uint8Array(eccLen);
	for (let i = 0; i < data.length; i++) {
		const factor = data[i]! ^ res[0]!;
		for (let j = 0; j < eccLen - 1; j++) {
			res[j] = res[j + 1]! ^ gfMul(gen[j + 1]!, factor);
		}
		res[eccLen - 1] = gfMul(gen[eccLen]!, factor);
	}
	return res;
}

/**
 * Standard ISO/IEC 18004 Table for ECC codewords and block division:
 * [eccPerBlock, count1, total1, data1, (count2, total2, data2)]
 */
// Level L ECC specs for versions 1..40
const ECC_SPECS_L: VersionEccSpec[] = [
	{ eccPerBlock: 7, blocks: [{ count: 1, totalCodewords: 26, dataCodewords: 19 }] }, // V1
	{ eccPerBlock: 10, blocks: [{ count: 1, totalCodewords: 44, dataCodewords: 34 }] }, // V2
	{ eccPerBlock: 15, blocks: [{ count: 1, totalCodewords: 70, dataCodewords: 55 }] }, // V3
	{ eccPerBlock: 20, blocks: [{ count: 1, totalCodewords: 100, dataCodewords: 80 }] }, // V4
	{ eccPerBlock: 26, blocks: [{ count: 1, totalCodewords: 134, dataCodewords: 108 }] }, // V5
	{ eccPerBlock: 18, blocks: [{ count: 2, totalCodewords: 86, dataCodewords: 68 }] }, // V6
	{ eccPerBlock: 20, blocks: [{ count: 2, totalCodewords: 98, dataCodewords: 78 }] }, // V7
	{ eccPerBlock: 24, blocks: [{ count: 2, totalCodewords: 121, dataCodewords: 97 }] }, // V8
	{ eccPerBlock: 30, blocks: [{ count: 2, totalCodewords: 146, dataCodewords: 116 }] }, // V9
	{
		eccPerBlock: 18,
		blocks: [
			{ count: 2, totalCodewords: 86, dataCodewords: 68 },
			{ count: 2, totalCodewords: 87, dataCodewords: 69 }
		]
	}, // V10
	{ eccPerBlock: 20, blocks: [{ count: 4, totalCodewords: 101, dataCodewords: 81 }] }, // V11
	{
		eccPerBlock: 24,
		blocks: [
			{ count: 2, totalCodewords: 116, dataCodewords: 92 },
			{ count: 2, totalCodewords: 117, dataCodewords: 93 }
		]
	}, // V12
	{ eccPerBlock: 26, blocks: [{ count: 4, totalCodewords: 133, dataCodewords: 107 }] }, // V13
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 3, totalCodewords: 145, dataCodewords: 115 },
			{ count: 1, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V14
	{
		eccPerBlock: 22,
		blocks: [
			{ count: 5, totalCodewords: 109, dataCodewords: 87 },
			{ count: 1, totalCodewords: 110, dataCodewords: 88 }
		]
	}, // V15
	{
		eccPerBlock: 24,
		blocks: [
			{ count: 5, totalCodewords: 122, dataCodewords: 98 },
			{ count: 1, totalCodewords: 123, dataCodewords: 99 }
		]
	}, // V16
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 1, totalCodewords: 135, dataCodewords: 107 },
			{ count: 5, totalCodewords: 136, dataCodewords: 108 }
		]
	}, // V17
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 5, totalCodewords: 150, dataCodewords: 120 },
			{ count: 1, totalCodewords: 151, dataCodewords: 121 }
		]
	}, // V18
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 3, totalCodewords: 141, dataCodewords: 113 },
			{ count: 4, totalCodewords: 142, dataCodewords: 114 }
		]
	}, // V19
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 3, totalCodewords: 135, dataCodewords: 107 },
			{ count: 5, totalCodewords: 136, dataCodewords: 108 }
		]
	}, // V20
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 4, totalCodewords: 144, dataCodewords: 116 },
			{ count: 4, totalCodewords: 145, dataCodewords: 117 }
		]
	}, // V21
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 2, totalCodewords: 151, dataCodewords: 123 },
			{ count: 7, totalCodewords: 152, dataCodewords: 124 }
		]
	}, // V22
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 4, totalCodewords: 147, dataCodewords: 117 },
			{ count: 5, totalCodewords: 148, dataCodewords: 118 }
		]
	}, // V23
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 6, totalCodewords: 151, dataCodewords: 121 },
			{ count: 4, totalCodewords: 152, dataCodewords: 122 }
		]
	}, // V24
	{
		eccPerBlock: 26,
		blocks: [
			{ count: 8, totalCodewords: 133, dataCodewords: 107 },
			{ count: 4, totalCodewords: 134, dataCodewords: 108 }
		]
	}, // V25
	{
		eccPerBlock: 28,
		blocks: [
			{ count: 10, totalCodewords: 142, dataCodewords: 114 },
			{ count: 2, totalCodewords: 143, dataCodewords: 115 }
		]
	}, // V26
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 8, totalCodewords: 152, dataCodewords: 122 },
			{ count: 4, totalCodewords: 153, dataCodewords: 123 }
		]
	}, // V27
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 3, totalCodewords: 147, dataCodewords: 117 },
			{ count: 10, totalCodewords: 148, dataCodewords: 118 }
		]
	}, // V28
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 7, totalCodewords: 146, dataCodewords: 116 },
			{ count: 7, totalCodewords: 147, dataCodewords: 117 }
		]
	}, // V29
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 5, totalCodewords: 145, dataCodewords: 115 },
			{ count: 10, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V30
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 13, totalCodewords: 145, dataCodewords: 115 },
			{ count: 3, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V31
	{ eccPerBlock: 30, blocks: [{ count: 17, totalCodewords: 145, dataCodewords: 115 }] }, // V32
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 17, totalCodewords: 145, dataCodewords: 115 },
			{ count: 1, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V33
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 13, totalCodewords: 145, dataCodewords: 115 },
			{ count: 6, totalCodewords: 146, dataCodewords: 116 }
		]
	}, // V34
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 12, totalCodewords: 151, dataCodewords: 121 },
			{ count: 7, totalCodewords: 152, dataCodewords: 122 }
		]
	}, // V35
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 6, totalCodewords: 151, dataCodewords: 121 },
			{ count: 14, totalCodewords: 152, dataCodewords: 122 }
		]
	}, // V36
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 17, totalCodewords: 152, dataCodewords: 122 },
			{ count: 4, totalCodewords: 153, dataCodewords: 123 }
		]
	}, // V37
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 4, totalCodewords: 152, dataCodewords: 122 },
			{ count: 18, totalCodewords: 153, dataCodewords: 123 }
		]
	}, // V38
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 20, totalCodewords: 147, dataCodewords: 117 },
			{ count: 4, totalCodewords: 148, dataCodewords: 118 }
		]
	}, // V39
	{
		eccPerBlock: 30,
		blocks: [
			{ count: 19, totalCodewords: 148, dataCodewords: 118 },
			{ count: 6, totalCodewords: 149, dataCodewords: 119 }
		]
	} // V40
];

const ALIGNMENT_PATTERN_POSITIONS: number[][] = [
	[], // V1
	[6, 18], // V2
	[6, 22], // V3
	[6, 26], // V4
	[6, 30], // V5
	[6, 34], // V6
	[6, 22, 38], // V7
	[6, 24, 42], // V8
	[6, 26, 46], // V9
	[6, 28, 50], // V10
	[6, 30, 54], // V11
	[6, 32, 58], // V12
	[6, 34, 62], // V13
	[6, 26, 46, 66], // V14
	[6, 26, 48, 70], // V15
	[6, 26, 50, 74], // V16
	[6, 30, 54, 78], // V17
	[6, 30, 56, 82], // V18
	[6, 30, 58, 86], // V19
	[6, 34, 62, 90], // V20
	[6, 28, 50, 72, 94], // V21
	[6, 26, 50, 74, 98], // V22
	[6, 30, 54, 78, 102], // V23
	[6, 28, 54, 80, 106], // V24
	[6, 32, 58, 84, 110], // V25
	[6, 30, 58, 86, 114], // V26
	[6, 34, 62, 90, 118], // V27
	[6, 26, 50, 74, 98, 122], // V28
	[6, 30, 54, 78, 102, 126], // V29
	[6, 26, 52, 78, 104, 130], // V30
	[6, 30, 56, 82, 108, 134], // V31
	[6, 34, 60, 86, 112, 138], // V32
	[6, 30, 58, 86, 114, 142], // V33
	[6, 34, 62, 90, 118, 146], // V34
	[6, 30, 54, 78, 102, 126, 150], // V35
	[6, 24, 50, 76, 102, 128, 154], // V36
	[6, 28, 54, 80, 106, 132, 158], // V37
	[6, 32, 58, 84, 110, 136, 162], // V38
	[6, 26, 54, 82, 110, 138, 166], // V39
	[6, 30, 58, 86, 114, 142, 170] // V40
];

// Version info bits for versions 7..40
const VERSION_INFO_BITS: number[] = [
	0x07c94, 0x085bc, 0x09a99, 0x0a4d3, 0x0bbf6, 0x0c762, 0x0d847, 0x0e60d, 0x0f928, 0x10b78, 0x1145d,
	0x12a17, 0x13532, 0x149a6, 0x15683, 0x168c9, 0x177ec, 0x18ec4, 0x191e1, 0x1afab, 0x1b08e, 0x1cc1a,
	0x1d33f, 0x1ed75, 0x1f250, 0x209d5, 0x216f0, 0x228ba, 0x2379f, 0x24b0b, 0x2542e, 0x26a64, 0x27541,
	0x28c69
];

// Format information bit patterns for Level L with mask 0
const FORMAT_L_MASK0 = 0x77c4 ^ 0x5412; // Level L: 01, Mask 0: 000 -> 0x5412

function getVersionSpec(version: number): VersionEccSpec {
	const spec = ECC_SPECS_L[version - 1];
	if (!spec) throw new Error(`Unsupported QR version: ${version}`);
	return spec;
}

function selectVersion(dataLen: number): number {
	for (let v = 1; v <= 40; v++) {
		const spec = getVersionSpec(v);
		const totalDataBytes = spec.blocks.reduce((acc, b) => acc + b.count * b.dataCodewords, 0);
		const overheadBytes = v <= 9 ? 2 : 3;
		if (dataLen + overheadBytes <= totalDataBytes) {
			return v;
		}
	}
	throw new Error(
		`Data payload too large for QR Code (length: ${dataLen}, max capacity: 2953 bytes)`
	);
}

function encodePayloadToCodewords(text: string, version: number): Uint8Array {
	const utf8Bytes = new TextEncoder().encode(text);
	const spec = getVersionSpec(version);
	const totalDataBytes = spec.blocks.reduce((acc, b) => acc + b.count * b.dataCodewords, 0);

	const bits: number[] = [];
	function pushBits(val: number, len: number) {
		for (let i = len - 1; i >= 0; i--) {
			bits.push((val >> i) & 1);
		}
	}

	// 1. Mode indicator: 0100 (Byte mode)
	pushBits(0x04, 4);

	// 2. Character count indicator
	const countBits = version <= 9 ? 8 : 16;
	pushBits(utf8Bytes.length, countBits);

	// 3. Data bytes
	for (const byte of utf8Bytes) {
		pushBits(byte, 8);
	}

	// 4. Terminator
	const totalDataBits = totalDataBytes * 8;
	const termLen = Math.min(4, totalDataBits - bits.length);
	pushBits(0, termLen);

	// 5. Pad to byte boundary
	while (bits.length % 8 !== 0) {
		bits.push(0);
	}

	// 6. Pad bytes 0xEC / 0x11
	const dataCodewords = new Uint8Array(totalDataBytes);
	for (let i = 0; i < bits.length / 8; i++) {
		let byteVal = 0;
		for (let b = 0; b < 8; b++) {
			byteVal = (byteVal << 1) | bits[i * 8 + b]!;
		}
		dataCodewords[i] = byteVal;
	}

	let pad = 0xec;
	for (let i = bits.length / 8; i < totalDataBytes; i++) {
		dataCodewords[i] = pad;
		pad = pad === 0xec ? 0x11 : 0xec;
	}

	// Interleave data blocks and ECC blocks
	const dataBlocks: Uint8Array[] = [];
	const eccBlocks: Uint8Array[] = [];
	let offset = 0;

	for (const group of spec.blocks) {
		for (let i = 0; i < group.count; i++) {
			const blockData = dataCodewords.subarray(offset, offset + group.dataCodewords);
			dataBlocks.push(blockData);
			eccBlocks.push(rsComputeEcc(blockData, spec.eccPerBlock));
			offset += group.dataCodewords;
		}
	}

	const finalCodewords: number[] = [];
	const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
	for (let i = 0; i < maxDataLen; i++) {
		for (const block of dataBlocks) {
			if (i < block.length) finalCodewords.push(block[i]!);
		}
	}
	for (let i = 0; i < spec.eccPerBlock; i++) {
		for (const block of eccBlocks) {
			finalCodewords.push(block[i]!);
		}
	}

	return Uint8Array.from(finalCodewords);
}

export interface QrMatrix {
	size: number;
	modules: boolean[][];
}

export function generateQrMatrix(text: string): QrMatrix {
	const version = selectVersion(new TextEncoder().encode(text).length);
	const size = version * 4 + 17;
	const modules: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
	const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

	function setModule(r: number, c: number, val: boolean, fn = true) {
		if (r >= 0 && r < size && c >= 0 && c < size) {
			modules[r]![c] = val;
			if (fn) isFunction[r]![c] = true;
		}
	}

	// Finder patterns
	function placeFinder(row: number, col: number) {
		for (let r = -1; r <= 7; r++) {
			for (let c = -1; c <= 7; c++) {
				const pr = row + r;
				const pc = col + c;
				if (pr < 0 || pr >= size || pc < 0 || pc >= size) continue;
				if (r === -1 || r === 7 || c === -1 || c === 7) {
					setModule(pr, pc, false);
				} else if (
					r === 0 ||
					r === 6 ||
					c === 0 ||
					c === 6 ||
					(r >= 2 && r <= 4 && c >= 2 && c <= 4)
				) {
					setModule(pr, pc, true);
				} else {
					setModule(pr, pc, false);
				}
			}
		}
	}

	placeFinder(0, 0);
	placeFinder(0, size - 7);
	placeFinder(size - 7, 0);

	// Timing patterns
	for (let i = 8; i < size - 8; i++) {
		if (modules[6]![i] === null) setModule(6, i, i % 2 === 0);
		if (modules[i]![6] === null) setModule(i, 6, i % 2 === 0);
	}

	// Alignment patterns
	const alignPos = ALIGNMENT_PATTERN_POSITIONS[version - 1] ?? [];
	for (const r of alignPos) {
		for (const c of alignPos) {
			if (isFunction[r]![c]) continue;
			for (let dr = -2; dr <= 2; dr++) {
				for (let dc = -2; dc <= 2; dc++) {
					const val = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
					setModule(r + dr, c + dc, val);
				}
			}
		}
	}

	// Dark module
	setModule(size - 8, 8, true);

	// Reserve format info area
	for (let i = 0; i < 9; i++) {
		if (modules[8]![i] === null) setModule(8, i, false, true);
		if (modules[i]![8] === null) setModule(i, 8, false, true);
	}
	for (let i = 0; i < 8; i++) {
		if (modules[8]![size - 1 - i] === null) setModule(8, size - 1 - i, false, true);
		if (modules[size - 1 - i]![8] === null) setModule(size - 1 - i, 8, false, true);
	}

	// Version information for Version >= 7
	if (version >= 7) {
		const vBits = VERSION_INFO_BITS[version - 7]!;
		for (let i = 0; i < 18; i++) {
			const bit = ((vBits >> i) & 1) === 1;
			const r = Math.floor(i / 3);
			const c = (i % 3) + size - 11;
			setModule(r, c, bit);
			setModule(c, r, bit);
		}
	}

	const codewords = encodePayloadToCodewords(text, version);

	// Placement in 2-column zigzag
	let bitIndex = 0;
	let row = size - 1;
	let dir = -1;

	for (let col = size - 1; col > 0; col -= 2) {
		if (col === 6) col--; // Skip vertical timing column
		while (true) {
			for (let c = 0; c < 2; c++) {
				const currCol = col - c;
				if (!isFunction[row]![currCol]) {
					const byteIdx = Math.floor(bitIndex / 8);
					const bitOffset = 7 - (bitIndex % 8);
					const bitVal =
						byteIdx < codewords.length ? ((codewords[byteIdx]! >> bitOffset) & 1) === 1 : false;
					modules[row]![currCol] = bitVal;
					bitIndex++;
				}
			}
			row += dir;
			if (row < 0 || row >= size) {
				dir = -dir;
				row += dir;
				break;
			}
		}
	}

	// Apply Mask 0: (row + col) % 2 === 0
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			if (!isFunction[r]![c]) {
				const maskCond = (r + c) % 2 === 0;
				if (maskCond) {
					modules[r]![c] = !modules[r]![c];
				}
			}
		}
	}

	// Write format information (Level L, Mask 0)
	const fmtVal = FORMAT_L_MASK0;
	for (let i = 0; i < 15; i++) {
		const bit = ((fmtVal >> i) & 1) === 1;
		if (i < 6) modules[8]![i] = bit;
		else if (i < 8) modules[8]![i + 1] = bit;
		else modules[8]![size - 15 + i] = bit;

		if (i < 8) modules[size - 1 - i]![8] = bit;
		else modules[14 - i]![8] = bit;
	}

	return {
		size,
		modules: modules.map((row) => row.map((cell) => Boolean(cell)))
	};
}

export function generateQrSvg(
	text: string,
	options: { margin?: number; color?: string; background?: string; size?: number } = {}
): string {
	const { margin = 2, color = '#000000', background = '#ffffff', size = 512 } = options;
	const matrix = generateQrMatrix(text);
	const fullSize = matrix.size + margin * 2;

	const pathParts: string[] = [];
	for (let r = 0; r < matrix.size; r++) {
		for (let c = 0; c < matrix.size; c++) {
			if (matrix.modules[r]![c]) {
				pathParts.push(`M${c + margin},${r + margin}h1v1h-1z`);
			}
		}
	}

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fullSize} ${fullSize}" width="${size}" height="${size}" shape-rendering="crispEdges" data-chronos-qr="${text}">` +
		`<metadata>${text}</metadata>` +
		`<rect width="${fullSize}" height="${fullSize}" fill="${background}"/>` +
		`<path d="${pathParts.join('')}" fill="${color}"/>` +
		`</svg>`
	);
}
