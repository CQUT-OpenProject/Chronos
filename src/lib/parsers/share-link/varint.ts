export function writeVarint(value: number, target: number[]): void {
	if (value < 0) {
		throw new RangeError('varint value must be non-negative');
	}
	let remaining = value;
	do {
		let byte = remaining & 0x7f;
		remaining >>>= 7;
		if (remaining > 0) byte |= 0x80;
		target.push(byte);
	} while (remaining > 0);
}

export function varintByteLength(value: number): number {
	if (value < 0) return 0;
	if (value < 0x80) return 1;
	if (value < 0x4000) return 2;
	if (value < 0x200000) return 3;
	if (value < 0x10000000) return 4;
	return 5;
}

export class VarintReader {
	private offset = 0;

	constructor(private readonly bytes: Uint8Array) {}

	read(): number {
		let result = 0;
		let shift = 0;
		while (this.offset < this.bytes.length) {
			const byte = this.bytes[this.offset++]!;
			result |= (byte & 0x7f) << shift;
			if ((byte & 0x80) === 0) return result;
			shift += 7;
			if (shift > 35) throw new RangeError('varint overflow');
		}
		throw new RangeError('unexpected end of varint');
	}

	get position(): number {
		return this.offset;
	}

	set position(value: number) {
		this.offset = value;
	}
}
