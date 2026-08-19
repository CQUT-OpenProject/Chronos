export class WebRuntimeAdapter {
	setTimeout(handler: () => void, timeoutMs: number): number {
		return setTimeout(handler, timeoutMs) as unknown as number;
	}

	clearTimeout(handle: number): void {
		clearTimeout(handle);
	}

	async sha256(data: string | Uint8Array): Promise<string> {
		const bytes: Uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data;
		const hashBuffer = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}

	encodeUtf8(str: string): Uint8Array {
		return new TextEncoder().encode(str);
	}

	decodeUtf8(bytes: Uint8Array): string {
		return new TextDecoder().decode(bytes);
	}
}
