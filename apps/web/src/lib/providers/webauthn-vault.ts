import type { IVaultService, VaultSecretOptions } from '@chronos/core';
import { isPrfProtectionAvailable } from '$lib/client/webauthn/prf-support';
import { base64ToBytes, bytesToBase64, randomBytes } from '$lib/client/webauthn/binary';
import { deriveAesKey, decryptPayload, encryptPayload } from '$lib/client/webauthn/prf-crypto';
import {
	createPrfCredential,
	getPrfOutput,
	WebAuthnCredentialUnavailableError
} from '$lib/client/webauthn/prf-coordinator';

const VAULT_PREFIX = 'chronos_vault_enc:';

interface EncryptedVaultRecord {
	credentialId: string;
	salt: string;
	iv: string;
	ciphertext: string;
}

export interface WebAuthnVaultDeps {
	storage?: Storage | null;
	createPrf?: typeof createPrfCredential;
	getPrf?: typeof getPrfOutput;
	isSupported?: () => Promise<boolean>;
}

export class WebAuthnVaultProvider implements IVaultService {
	private storage: Storage | null;
	private createPrf: typeof createPrfCredential;
	private getPrf: typeof getPrfOutput;
	private supported: () => Promise<boolean>;

	constructor(
		storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null,
		deps: WebAuthnVaultDeps = {}
	) {
		this.storage = deps.storage ?? storage;
		this.createPrf = deps.createPrf ?? createPrfCredential;
		this.getPrf = deps.getPrf ?? getPrfOutput;
		this.supported = deps.isSupported ?? isPrfProtectionAvailable;
	}

	async isSupported(): Promise<boolean> {
		return this.supported();
	}

	async storeSecret(key: string, secret: string, _options?: VaultSecretOptions): Promise<void> {
		if (!this.storage) {
			throw new Error('Storage is not available for vault');
		}
		if (!(await this.isSupported())) {
			throw new Error('WebAuthn PRF vault is not available');
		}

		const saltBytes = randomBytes(32);
		const { credentialId, prfOutput } = await this.createPrf(saltBytes);
		const aesKey = await deriveAesKey(base64ToBytes(prfOutput), saltBytes);
		const encoded = new TextEncoder().encode(secret);
		const encrypted = await encryptPayload(aesKey, encoded);
		const record: EncryptedVaultRecord = {
			credentialId,
			salt: bytesToBase64(saltBytes),
			iv: encrypted.iv,
			ciphertext: encrypted.ciphertext
		};
		this.storage.setItem(`${VAULT_PREFIX}${key}`, JSON.stringify(record));
	}

	async getSecret(key: string): Promise<string | null> {
		if (!this.storage) return null;
		const raw = this.storage.getItem(`${VAULT_PREFIX}${key}`);
		if (!raw) return null;

		let record: EncryptedVaultRecord;
		try {
			record = JSON.parse(raw) as EncryptedVaultRecord;
		} catch {
			return null;
		}
		if (!record.credentialId || !record.salt || !record.iv || !record.ciphertext) {
			return null;
		}

		try {
			const prfOutput = await this.getPrf(record.salt, record.credentialId);
			const aesKey = await deriveAesKey(base64ToBytes(prfOutput), base64ToBytes(record.salt));
			const decrypted = await decryptPayload(aesKey, record.iv, record.ciphertext);
			return new TextDecoder().decode(decrypted);
		} catch (error) {
			if (error instanceof WebAuthnCredentialUnavailableError) {
				this.storage.removeItem(`${VAULT_PREFIX}${key}`);
				return null;
			}
			throw error;
		}
	}

	async removeSecret(key: string): Promise<void> {
		if (!this.storage) return;
		this.storage.removeItem(`${VAULT_PREFIX}${key}`);
	}
}
