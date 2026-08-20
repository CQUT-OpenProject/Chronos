import type { IRuntimeService } from '@chronos/core';

/**
 * WebRuntimeProvider implements the IRuntimeService interface for browser environments.
 * It provides platform baselines including timers, TextEncoder/Decoder, and SHA-256 via WebCrypto.
 */
export class WebRuntimeProvider implements IRuntimeService {
	readonly platform = 'web' as const;

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
