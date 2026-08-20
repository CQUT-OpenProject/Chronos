export interface EncryptedOnlineCredentialRecord {
	mode: 'prf';
	account: string;
	credentialId: string;
	salt: string;
	iv: string;
	ciphertext: string;
}

export interface AccountOnlyOnlineCredentialRecord {
	mode: 'account_only';
	account: string;
}

export type OnlineCredentialRecord =
	| EncryptedOnlineCredentialRecord
	| AccountOnlyOnlineCredentialRecord;

const STORAGE_KEY = 'chronos:online-credential-v1';

export function readOnlineCredentialRecord(
	storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null
): OnlineCredentialRecord | null {
	if (!storage) return null;
	const raw = storage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as OnlineCredentialRecord;
	} catch {
		return null;
	}
}

export function writeOnlineCredentialRecord(
	record: OnlineCredentialRecord | null,
	storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null
): void {
	if (!storage) return;
	if (!record) {
		storage.removeItem(STORAGE_KEY);
		return;
	}
	storage.setItem(STORAGE_KEY, JSON.stringify(record));
}
