import { describe, expect, it } from 'vite-plus/test';
import { appendCrc32, crc32, verifyAndStripCrc32 } from './crc32';

describe('crc32', () => {
	it('matches the IEEE CRC-32 vector', () => {
		const bytes = new TextEncoder().encode('123456789');
		expect(crc32(bytes)).toBe(0xcbf4_3926);
	});

	it('appends and verifies a little-endian checksum trailer', () => {
		const payload = new Uint8Array([0x43, 0x53, 0x01, 0x00]);
		const withChecksum = appendCrc32(payload);
		expect(withChecksum).toHaveLength(payload.length + 4);
		expect(verifyAndStripCrc32(withChecksum)).toEqual(payload);
	});

	it('rejects checksum mismatches', () => {
		const payload = appendCrc32(new Uint8Array([1, 2, 3, 4]));
		payload[payload.length - 1]! ^= 0x01;
		expect(() => verifyAndStripCrc32(payload)).toThrow('checksum mismatch');
	});
});
