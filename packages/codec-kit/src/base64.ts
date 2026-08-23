const CHUNK_SIZE = 8192;

function toBinaryString(bytes: Uint8Array): string {
	let binary = '';
	for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
		binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK_SIZE));
	}
	return binary;
}

function fromBinaryString(binary: string): Uint8Array {
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
	return btoa(toBinaryString(bytes));
}

export function bytesToBase64Url(bytes: Uint8Array): string {
	return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64ToBytes(value: string): Uint8Array {
	return fromBinaryString(atob(value));
}

export function base64UrlToBytes(value: string): Uint8Array {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	return base64ToBytes(padded);
}
