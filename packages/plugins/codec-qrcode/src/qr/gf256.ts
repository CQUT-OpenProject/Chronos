/** Galois field GF(256) helpers for Reed-Solomon ECC (ISO/IEC 18004). */
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

export function gfMul(x: number, y: number): number {
	if (x === 0 || y === 0) return 0;
	return GF_EXP[GF_LOG[x]! + GF_LOG[y]!]!;
}

export function rsGeneratorPoly(degree: number): Uint8Array {
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

export function rsComputeEcc(data: Uint8Array, eccLen: number): Uint8Array {
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
