import { ShareBinaryDecodeError } from './share-binary-decode-error';

const CRC32_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let index = 0; index < 256; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1) {
			value = (value & 1) !== 0 ? (value >>> 1) ^ 0xedb8_8320 : value >>> 1;
		}
		table[index] = value >>> 0;
	}
	return table;
})();

export function crc32(bytes: Uint8Array): number {
	let checksum = 0xffff_ffff;
	for (const byte of bytes) {
		checksum = (CRC32_TABLE[(checksum ^ byte) & 0xff]! ^ (checksum >>> 8)) >>> 0;
	}
	return (checksum ^ 0xffff_ffff) >>> 0;
}

export function appendCrc32(bytes: Uint8Array): Uint8Array {
	const checksum = crc32(bytes);
	const result = new Uint8Array(bytes.length + 4);
	result.set(bytes);
	result[bytes.length] = checksum & 0xff;
	result[bytes.length + 1] = (checksum >>> 8) & 0xff;
	result[bytes.length + 2] = (checksum >>> 16) & 0xff;
	result[bytes.length + 3] = (checksum >>> 24) & 0xff;
	return result;
}

export function verifyAndStripCrc32(bytes: Uint8Array): Uint8Array {
	if (bytes.length < 4) throw new ShareBinaryDecodeError('checksum mismatch');

	const payload = bytes.subarray(0, -4);
	const expected =
		bytes[bytes.length - 4]! |
		(bytes[bytes.length - 3]! << 8) |
		(bytes[bytes.length - 2]! << 16) |
		(bytes[bytes.length - 1]! << 24);

	if (crc32(payload) !== expected >>> 0) {
		throw new ShareBinaryDecodeError('checksum mismatch');
	}

	return payload;
}
