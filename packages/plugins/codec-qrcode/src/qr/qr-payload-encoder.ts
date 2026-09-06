/** Byte-mode encoding, version selection, and Reed–Solomon interleaving. */
import { ECC_SPECS_L, type VersionEccSpec } from './ecc-specs';
import { rsComputeEcc } from './gf256';

export function getVersionSpec(version: number): VersionEccSpec {
	const spec = ECC_SPECS_L[version - 1];
	if (!spec) throw new Error(`Unsupported QR version: ${version}`);
	return spec;
}

/** Pick the smallest version whose level-L data capacity fits the UTF-8 payload. */
export function selectVersion(dataLen: number): number {
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

/**
 * Byte-mode payload → interleaved codewords (data + Reed–Solomon ECC).
 * Fixed to level L; mask selection happens later in matrix layout.
 */
export function encodePayloadToCodewords(text: string, version: number): Uint8Array {
	const utf8Bytes = new TextEncoder().encode(text);
	const spec = getVersionSpec(version);
	const totalDataBytes = spec.blocks.reduce((acc, b) => acc + b.count * b.dataCodewords, 0);

	const bits: number[] = [];
	function pushBits(val: number, len: number) {
		for (let i = len - 1; i >= 0; i--) {
			bits.push((val >> i) & 1);
		}
	}

	pushBits(0x04, 4);

	const countBits = version <= 9 ? 8 : 16;
	pushBits(utf8Bytes.length, countBits);

	for (const byte of utf8Bytes) {
		pushBits(byte, 8);
	}

	const totalDataBits = totalDataBytes * 8;
	const termLen = Math.min(4, totalDataBits - bits.length);
	pushBits(0, termLen);

	while (bits.length % 8 !== 0) {
		bits.push(0);
	}

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
