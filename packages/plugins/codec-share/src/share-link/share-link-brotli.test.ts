import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { deflateRaw } from '@chronos/codec-kit';
import {
	brotliCompressShare,
	brotliDecompressShare,
	decompressShareAdaptive,
	ensureShareLinkBrotliReady,
	SHARE_BROTLI_QUALITY,
	SHARE_LINK_VERSION_DEFLATE
} from './share-link-brotli';

describe('share-link-brotli', () => {
	beforeAll(async () => {
		await ensureShareLinkBrotliReady();
	});

	it('round-trips bytes at quality 11', () => {
		const input = new TextEncoder().encode('Chronos share-link brotli benchmark payload');
		const compressed = brotliCompressShare(input);
		expect(compressed.length).toBeGreaterThan(0);
		expect(brotliDecompressShare(compressed)).toEqual(input);
	});

	it('uses quality 11', () => {
		expect(SHARE_BROTLI_QUALITY).toBe(11);
	});

	it('rejects decompressed output beyond the safety cap', async () => {
		const repetitive = new Uint8Array(300_000).fill(0x41);
		const compressed = await deflateRaw(repetitive);

		await expect(decompressShareAdaptive(SHARE_LINK_VERSION_DEFLATE, compressed)).rejects.toThrow(
			/exceeds decompression limit/
		);
	});
});
