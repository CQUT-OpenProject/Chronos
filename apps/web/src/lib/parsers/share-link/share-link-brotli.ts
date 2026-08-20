import { browser } from '$app/environment';

export const SHARE_BROTLI_QUALITY = 11;

interface BrotliApi {
	compress(bytes: Uint8Array, options?: { quality?: number }): Uint8Array;
	decompress(bytes: Uint8Array): Uint8Array;
}

let brotli: BrotliApi | null = null;
let initPromise: Promise<void> | null = null;

async function createNodeBrotli(): Promise<BrotliApi> {
	const zlib = await import('node:zlib');
	return {
		compress(bytes, options) {
			return zlib.brotliCompressSync(Buffer.from(bytes), {
				params: {
					[zlib.constants.BROTLI_PARAM_QUALITY]: options?.quality ?? SHARE_BROTLI_QUALITY
				}
			});
		},
		decompress(bytes) {
			return new Uint8Array(zlib.brotliDecompressSync(Buffer.from(bytes)));
		}
	};
}

export function ensureShareLinkBrotliReady(): Promise<void> {
	if (brotli) return Promise.resolve();
	if (!initPromise) {
		initPromise = (async () => {
			brotli = browser ? await (await import('brotli-wasm')).default : await createNodeBrotli();
		})();
	}
	return initPromise;
}

function getBrotli(): BrotliApi {
	if (!brotli) throw new Error('share link brotli is not initialized');
	return brotli;
}

export function brotliCompressShare(bytes: Uint8Array): Uint8Array {
	return getBrotli().compress(bytes, { quality: SHARE_BROTLI_QUALITY });
}

export function brotliDecompressShare(bytes: Uint8Array): Uint8Array {
	return getBrotli().decompress(bytes);
}
