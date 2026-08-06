import type { SavedCredentialState } from '$lib/models/auth';
import type { SecureCredentialStore } from '../interfaces/secure-credential-store';
import { AppError } from '../result/app-error';
import { failure, type AppResult } from '../result/app-result';

export function createStubSecureCredentialStore(): SecureCredentialStore {
	const state: SavedCredentialState = {
		account: null,
		hasSavedCredential: false,
		protectionAvailable: false
	};

	return {
		subscribeSavedCredentialState(listener) {
			listener(state);
			return () => undefined;
		},
		async saveCredential() {
			return failure(AppError.unknown('Not implemented'));
		},
		async unlockCredential() {
			return failure(AppError.unknown('Not implemented'));
		},
		async clearCredential() {
			return failure(AppError.unknown('Not implemented'));
		},
		async prepareSave() {
			return failure(AppError.unknown('Not implemented'));
		},
		async prepareUnlock() {
			return failure(AppError.unknown('Not implemented'));
		}
	};
}

export class SaveOnlineCredentialUseCase {
	constructor(private readonly secureCredentialStore: SecureCredentialStore) {}

	async invoke(account: string, password: string, unlockToken: string): Promise<AppResult<void>> {
		return this.secureCredentialStore.saveCredential(account, password, unlockToken);
	}
}

export class ClearOnlineCredentialUseCase {
	constructor(private readonly secureCredentialStore: SecureCredentialStore) {}

	async invoke(): Promise<AppResult<void>> {
		return this.secureCredentialStore.clearCredential();
	}
}

export class UnlockOnlineCredentialUseCase {
	constructor(private readonly secureCredentialStore: SecureCredentialStore) {}

	async invoke(unlockToken: string): Promise<AppResult<{ account: string; password: string }>> {
		return this.secureCredentialStore.unlockCredential(unlockToken);
	}
}

export class PrepareCredentialSaveUseCase {
	constructor(private readonly secureCredentialStore: SecureCredentialStore) {}

	async invoke(): Promise<AppResult<string>> {
		return this.secureCredentialStore.prepareSave();
	}
}

export class PrepareCredentialUnlockUseCase {
	constructor(private readonly secureCredentialStore: SecureCredentialStore) {}

	async invoke(): Promise<AppResult<string>> {
		return this.secureCredentialStore.prepareUnlock();
	}
}

export class ObserveSavedCredentialStateUseCase {
	constructor(private readonly secureCredentialStore: SecureCredentialStore) {}

	subscribe(listener: (state: SavedCredentialState) => void): () => void {
		return this.secureCredentialStore.subscribeSavedCredentialState(listener);
	}
}
