import { ALIGNMENT_PATTERN_POSITIONS, FORMAT_L_MASK0, VERSION_INFO_BITS } from './qr-layout-tables';
import { encodePayloadToCodewords } from './qr-payload-encoder';

export interface QrMatrix {
	size: number;
	modules: boolean[][];
}

/**
 * Lay out function patterns, zigzag data bits, mask 0, and format info.
 * Caller supplies version and pre-sized module grid state.
 */
export function layoutQrModules(
	version: number,
	size: number,
	modules: (boolean | null)[][],
	isFunction: boolean[][],
	codewords: Uint8Array
): void {
	function setModule(r: number, c: number, val: boolean, fn = true) {
		if (r >= 0 && r < size && c >= 0 && c < size) {
			modules[r]![c] = val;
			if (fn) isFunction[r]![c] = true;
		}
	}

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

	for (let i = 8; i < size - 8; i++) {
		if (modules[6]![i] === null) setModule(6, i, i % 2 === 0);
		if (modules[i]![6] === null) setModule(i, 6, i % 2 === 0);
	}

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

	setModule(size - 8, 8, true);

	for (let i = 0; i < 9; i++) {
		if (modules[8]![i] === null) setModule(8, i, false, true);
		if (modules[i]![8] === null) setModule(i, 8, false, true);
	}
	for (let i = 0; i < 8; i++) {
		if (modules[8]![size - 1 - i] === null) setModule(8, size - 1 - i, false, true);
		if (modules[size - 1 - i]![8] === null) setModule(size - 1 - i, 8, false, true);
	}

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

	let bitIndex = 0;
	let row = size - 1;
	let dir = -1;

	for (let col = size - 1; col > 0; col -= 2) {
		if (col === 6) col--;
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

	const fmtVal = FORMAT_L_MASK0;
	for (let i = 0; i < 15; i++) {
		const bit = ((fmtVal >> i) & 1) === 1;
		if (i < 6) modules[8]![i] = bit;
		else if (i < 8) modules[8]![i + 1] = bit;
		else modules[8]![size - 15 + i] = bit;

		if (i < 8) modules[size - 1 - i]![8] = bit;
		else modules[14 - i]![8] = bit;
	}
}

/** Build a boolean module matrix for the given UTF-8 text (versions 1–40, level L). */
export function buildQrMatrix(text: string, version: number): QrMatrix {
	const size = version * 4 + 17;
	const modules: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
	const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
	const codewords = encodePayloadToCodewords(text, version);

	layoutQrModules(version, size, modules, isFunction, codewords);

	return {
		size,
		modules: modules.map((row) => row.map((cell) => Boolean(cell)))
	};
}
