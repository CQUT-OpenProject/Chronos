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

function isDeflateSupported(): boolean {
	if (!isBrowser) return false;
	if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined')
		return false;
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = new CompressionStream('deflate');
		return true;
	} catch {
		return false;
	}
}

async function deflateCompress(bytes: Uint8Array): Promise<Uint8Array> {
	if (isBrowser && typeof CompressionStream !== 'undefined') {
		try {
			const cs = new CompressionStream('deflate');
			const writer = cs.writable.getWriter();
			const reader = cs.readable.getReader();
			const chunks: Uint8Array[] = [];
			const pump = (async () => {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					if (value) chunks.push(value as Uint8Array);
				}
			})();
			await writer.write(bytes as unknown as BufferSource);
			await writer.close();
			await pump;
			const total = chunks.reduce((sum, c) => sum + c.length, 0);
			const out = new Uint8Array(total);
			let offset = 0;
			for (const c of chunks) {
				out.set(c, offset);
				offset += c.length;
			}
			return out;
		} catch {
			// fallback to zlib
		}
	}
	const zlib = await import('node:zlib');
	return zlib.deflateSync(Buffer.from(bytes)) as unknown as Uint8Array;
}

async function deflateDecompress(bytes: Uint8Array): Promise<Uint8Array> {
	if (isBrowser && typeof DecompressionStream !== 'undefined') {
		try {
			const ds = new DecompressionStream('deflate');
			const writer = ds.writable.getWriter();
			const reader = ds.readable.getReader();
			const chunks: Uint8Array[] = [];
			const pump = (async () => {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					if (value) chunks.push(value as Uint8Array);
				}
			})();
			await writer.write(bytes as unknown as BufferSource);
			await writer.close();
			await pump;
			const total = chunks.reduce((sum, c) => sum + c.length, 0);
			const out = new Uint8Array(total);
			let offset = 0;
			for (const c of chunks) {
				out.set(c, offset);
				offset += c.length;
			}
			return out;
		} catch {
			// fallback to zlib
		}
	}
	const zlib = await import('node:zlib');
	return new Uint8Array(zlib.inflateSync(Buffer.from(bytes)));
}

export async function compressShareAdaptive(
	bytes: Uint8Array
): Promise<{ version: number; bytes: Uint8Array }> {
	if (isDeflateSupported()) {
		try {
			const deflated = await deflateCompress(bytes);
			// 仅当 deflate 产物体积不显著劣于 brotli 时使用；此处直接采用 deflate 以减体积
			return { version: SHARE_LINK_VERSION_DEFLATE, bytes: deflated };
		} catch {
			// fallback to brotli
		}
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
			return await deflateDecompress(bytes);
		} catch {
			// fallback to brotli
		}
	}
	await ensureShareLinkBrotliReady();
	return brotliDecompressShare(bytes);
}
