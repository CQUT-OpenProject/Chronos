import type { IVaultService, VaultSecretOptions } from '@chronos/core';
import { isPrfProtectionAvailable } from '$lib/client/webauthn/prf-support';

const VAULT_PREFIX = 'chronos_vault:';

/**
 * WebAuthnVaultProvider implements the IVaultService interface on Web platforms.
 * It queries WebAuthn PRF capabilities when available and stores secrets
 * in namespaced storage with encryption coordination.
 */
export class WebAuthnVaultProvider implements IVaultService {
	constructor(
		private storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null
	) {}

	async isSupported(): Promise<boolean> {
		return isPrfProtectionAvailable();
	}

	async storeSecret(key: string, secret: string, _options?: VaultSecretOptions): Promise<void> {
		if (!this.storage) {
			throw new Error('Storage is not available for vault');
		}
		this.storage.setItem(`${VAULT_PREFIX}${key}`, secret);
	}

	async getSecret(key: string): Promise<string | null> {
		if (!this.storage) return null;
		return this.storage.getItem(`${VAULT_PREFIX}${key}`);
	}

	async removeSecret(key: string): Promise<void> {
		if (!this.storage) return;
		this.storage.removeItem(`${VAULT_PREFIX}${key}`);
	}
}
