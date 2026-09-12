/**
 * Binary values accepted by `IStorageService.setPluginData`.
 * Reads for binary keys always surface as `Blob` from the host adapter.
 */
export type PluginBinaryValue = Blob | Uint8Array;

export interface PluginBinaryWireFormat {
	__binary: true;
	mimeType: string;
	base64: string;
}

export function isPluginBinaryValue(value: unknown): value is PluginBinaryValue {
	if (value instanceof Uint8Array) return true;
	return typeof Blob !== 'undefined' && value instanceof Blob;
}

export function isPluginBinaryWireFormat(value: unknown): value is PluginBinaryWireFormat {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as PluginBinaryWireFormat).__binary === true &&
		typeof (value as PluginBinaryWireFormat).base64 === 'string'
	);
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export async function serializePluginDataForNative(value: unknown): Promise<unknown> {
	if (!isPluginBinaryValue(value)) return value;
	const mimeType = value instanceof Blob && value.type ? value.type : 'application/octet-stream';
	const bytes = value instanceof Uint8Array ? value : new Uint8Array(await value.arrayBuffer());
	return {
		__binary: true,
		mimeType,
		base64: bytesToBase64(bytes)
	} satisfies PluginBinaryWireFormat;
}

export function deserializePluginDataFromNative(value: unknown): unknown {
	if (!isPluginBinaryWireFormat(value)) return value;
	return new Blob([new Uint8Array(base64ToBytes(value.base64))], {
		type: value.mimeType || 'application/octet-stream'
	});
}
