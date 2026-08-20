import type { IVaultService, VaultSecretOptions } from '@chronos/core';

export class MemoryVaultProvider implements IVaultService {
	private secrets = new Map<string, string>();

	async isSupported(): Promise<boolean> {
		return true;
	}

	async storeSecret(key: string, secret: string, _options?: VaultSecretOptions): Promise<void> {
		this.secrets.set(key, secret);
	}

	async getSecret(key: string): Promise<string | null> {
		return this.secrets.get(key) ?? null;
	}

	async removeSecret(key: string): Promise<void> {
		this.secrets.delete(key);
	}
}
