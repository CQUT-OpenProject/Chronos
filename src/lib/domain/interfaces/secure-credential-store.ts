import type { SavedCredentialState } from '$lib/models/auth';
import type { AppResult } from '../result/app-result';

export interface SecureCredentialStore {
	subscribeSavedCredentialState(listener: (state: SavedCredentialState) => void): () => void;
	saveCredential(account: string, password: string, unlockToken: string): Promise<AppResult<void>>;
	unlockCredential(unlockToken: string): Promise<AppResult<{ account: string; password: string }>>;
	clearCredential(): Promise<AppResult<void>>;
	prepareSave(): Promise<AppResult<string>>;
	prepareUnlock(): Promise<AppResult<string>>;
}
