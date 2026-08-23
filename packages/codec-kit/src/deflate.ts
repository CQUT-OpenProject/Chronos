async function collect(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
	if (typeof CompressionStream === 'undefined') {
		const specifier = ['node', 'zlib'].join(':');
		const zlib = (await import(/* @vite-ignore */ specifier)) as typeof import('node:zlib');
		return new Uint8Array(zlib.deflateRawSync(Buffer.from(bytes)));
	}
	const stream = new CompressionStream('deflate-raw');
	const writer = stream.writable.getWriter();
	await writer.write(bytes as unknown as BufferSource);
	await writer.close();
	return collect(stream.readable);
}

export async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
	if (typeof DecompressionStream === 'undefined') {
		const specifier = ['node', 'zlib'].join(':');
		const zlib = (await import(/* @vite-ignore */ specifier)) as typeof import('node:zlib');
		return new Uint8Array(zlib.inflateRawSync(Buffer.from(bytes)));
	}
	const stream = new DecompressionStream('deflate-raw');
	const writer = stream.writable.getWriter();
	await writer.write(bytes as unknown as BufferSource);
	await writer.close();
	return collect(stream.readable);
}
