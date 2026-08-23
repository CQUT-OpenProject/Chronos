import { describe, expect, it } from 'vite-plus/test';
import {
	appendCrc32,
	base64ToBytes,
	base64UrlToBytes,
	bitmaskToWeeks,
	bytesToBase64,
	bytesToBase64Url,
	crc32,
	StringInterner,
	VarintReader,
	verifyAndStripCrc32,
	writeVarint,
	MAX_TIMETABLE_WEEK,
	weeksToBitmask,
	deflateRaw,
	inflateRaw
} from '@chronos/codec-kit';

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

	it('returns null on checksum mismatch', () => {
		const payload = appendCrc32(new Uint8Array([1, 2, 3, 4]));
		payload[payload.length - 1]! ^= 0x01;
		expect(verifyAndStripCrc32(payload)).toBeNull();
	});

	it('returns null when the trailer is missing', () => {
		expect(verifyAndStripCrc32(new Uint8Array([1, 2, 3]))).toBeNull();
	});
});

describe('varint', () => {
	it('round-trips single and multi byte values', () => {
		for (const value of [0, 1, 127, 128, 300, 16384, 0x7fff_ffff]) {
			const target: number[] = [];
			writeVarint(value, target);
			const reader = new VarintReader(new Uint8Array(target));
			expect(reader.read()).toBe(value);
			expect(reader.position).toBe(target.length);
		}
	});

	it('rejects negative values', () => {
		expect(() => writeVarint(-1, [])).toThrow(RangeError);
	});

	it('rejects truncated input', () => {
		expect(() => new VarintReader(new Uint8Array([0x80])).read()).toThrow(RangeError);
	});
});

describe('week bitmask', () => {
	it('round-trips contiguous and sparse weeks', () => {
		expect(
			bitmaskToWeeks(weeksToBitmask([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]))
		).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
		expect(bitmaskToWeeks(weeksToBitmask([1, 3, 5]))).toEqual([1, 3, 5]);
		expect(bitmaskToWeeks(weeksToBitmask([MAX_TIMETABLE_WEEK]))).toEqual([MAX_TIMETABLE_WEEK]);
	});

	it('encodes week n as bit n-1', () => {
		expect(weeksToBitmask([1])).toBe(0b1);
		expect(weeksToBitmask([2])).toBe(0b10);
		expect(weeksToBitmask([32])).toBe(0x8000_0000);
	});

	it('rejects weeks outside the supported range', () => {
		expect(() => weeksToBitmask([0])).toThrow(/week out of range/);
		expect(() => weeksToBitmask([33])).toThrow(/week out of range/);
	});

	it('decodes an empty mask to no weeks', () => {
		expect(bitmaskToWeeks(0)).toEqual([]);
	});
});

describe('base64', () => {
	it('round-trips standard base64', () => {
		const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 253, 254, 255]);
		expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
	});

	it('produces padded standard output', () => {
		expect(bytesToBase64(new Uint8Array([0x43, 0x53]))).toBe('Q1M=');
	});

	it('round-trips unpadded url-safe base64', () => {
		const bytes = new Uint8Array([0xfb, 0xff, 0xef, 0x3e, 0x9f]);
		const encoded = bytesToBase64Url(bytes);
		expect(encoded).not.toMatch(/[+/=]/);
		expect(base64UrlToBytes(encoded)).toEqual(bytes);
	});
});

describe('deflateRaw / inflateRaw', () => {
	it('round-trips bytes', async () => {
		const input = new TextEncoder().encode(
			'Chronos codec-kit deflate round trip payload '.repeat(20)
		);
		const compressed = await deflateRaw(input);
		expect(compressed.length).toBeLessThan(input.length);
		expect(await inflateRaw(compressed)).toEqual(input);
	});

	it('rejects corrupted payloads on inflate', async () => {
		const compressed = await deflateRaw(new TextEncoder().encode('payload'));
		const corrupted = compressed.slice();
		corrupted[0]! ^= 0xff;
		await expect(inflateRaw(corrupted)).rejects.toThrow();
	});
});

describe('StringInterner', () => {
	it('deduplicates trimmed values and maps empties to -1', () => {
		const interner = new StringInterner();
		expect(interner.intern(' 高等数学 ')).toBe(0);
		expect(interner.intern('高等数学')).toBe(0);
		expect(interner.intern('  ')).toBe(-1);
		expect(interner.intern(undefined)).toBe(-1);
		expect(interner.strings).toEqual(['高等数学']);
	});

	it('seeds index 0 with the seed value', () => {
		const interner = new StringInterner({ seed: '2025-2026-1' });
		expect(interner.strings[0]).toBe('2025-2026-1');
		expect(interner.intern('2025-2026-1')).toBe(0);
	});

	it('throws when exceeding maxEntries', () => {
		const interner = new StringInterner({ maxEntries: 1 });
		interner.intern('a');
		expect(() => interner.intern('b')).toThrow(/overflow/);
		expect(interner.intern('a')).toBe(0);
	});
});
