import type { IRuntimeService } from '@chronos/core';

/** Web runtime port: SHA-256 via Web Crypto. */
export class WebRuntimeProvider implements IRuntimeService {
	readonly platform = 'web' as const;

	async sha256(data: string | Uint8Array): Promise<string> {
		const bytes: Uint8Array = typeof data === 'string' ? new TextEncoder().encode(data) : data;
		const hashBuffer = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}
}
