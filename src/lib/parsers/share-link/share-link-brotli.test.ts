import { beforeAll, describe, expect, it } from 'vite-plus/test';
import {
	brotliCompressShare,
	brotliDecompressShare,
	ensureShareLinkBrotliReady,
	SHARE_BROTLI_QUALITY
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
});
