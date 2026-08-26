export async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
	if (typeof CompressionStream === 'undefined') {
		const specifier = ['node', 'zlib'].join(':');
		const zlib = (await import(/* @vite-ignore */ specifier)) as typeof import('node:zlib');
		return new Uint8Array(zlib.deflateRawSync(Buffer.from(bytes)));
	}
	const input = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(bytes);
			controller.close();
		}
	});
	const output = input.pipeThrough(
		new CompressionStream('deflate-raw') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>
	);
	return new Uint8Array(await new Response(output).arrayBuffer());
}

export async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
	if (typeof DecompressionStream === 'undefined') {
		const specifier = ['node', 'zlib'].join(':');
		const zlib = (await import(/* @vite-ignore */ specifier)) as typeof import('node:zlib');
		return new Uint8Array(zlib.inflateRawSync(Buffer.from(bytes)));
	}
	const input = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(bytes);
			controller.close();
		}
	});
	const output = input.pipeThrough(
		new DecompressionStream('deflate-raw') as unknown as ReadableWritablePair<
			Uint8Array,
			Uint8Array
		>
	);
	return new Uint8Array(await new Response(output).arrayBuffer());
}
