export function encodePasswordPayload(password: string): Uint8Array {
	return new TextEncoder().encode(password);
}

export function decodePasswordPayload(bytes: Uint8Array): string {
	return new TextDecoder().decode(bytes);
}
