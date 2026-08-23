import { deflateRaw, inflateRaw } from '@chronos/codec-kit';

export const SHARE_BROTLI_QUALITY = 11;
export const SHARE_LINK_VERSION_BROTLI = 1;
export const SHARE_LINK_VERSION_DEFLATE = 2;

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

const isBrowser = typeof window !== 'undefined';

export function ensureShareLinkBrotliReady(): Promise<void> {
	if (brotli) return Promise.resolve();
	if (!initPromise) {
		initPromise = (async () => {
			brotli = isBrowser ? await (await import('brotli-wasm')).default : await createNodeBrotli();
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

export async function compressShareAdaptive(
	bytes: Uint8Array
): Promise<{ version: number; bytes: Uint8Array }> {
	try {
		return { version: SHARE_LINK_VERSION_DEFLATE, bytes: await deflateRaw(bytes) };
	} catch {
		// fallback to brotli
	}
	await ensureShareLinkBrotliReady();
	return { version: SHARE_LINK_VERSION_BROTLI, bytes: brotliCompressShare(bytes) };
}

export async function decompressShareAdaptive(
	version: number,
	bytes: Uint8Array
): Promise<Uint8Array> {
	if (version === SHARE_LINK_VERSION_DEFLATE) {
		try {
			return await inflateRaw(bytes);
		} catch {
			// fallback to brotli
		}
	}
	await ensureShareLinkBrotliReady();
	return brotliDecompressShare(bytes);
}
