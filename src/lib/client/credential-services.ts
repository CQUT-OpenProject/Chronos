import {
	ClearOnlineCredentialUseCase,
	ObserveSavedCredentialStateUseCase,
	PrepareCredentialSaveUseCase,
	PrepareCredentialUnlockUseCase,
	SaveOnlineCredentialUseCase,
	UnlockOnlineCredentialUseCase
} from '$lib/domain/usecases/credential';
import { createWebAuthnSecureCredentialStore } from './webauthn-secure-credential-store';

export function createCredentialServices(
	secureCredentialStore = createWebAuthnSecureCredentialStore()
) {
	return {
		secureCredentialStore,
		saveCredential: new SaveOnlineCredentialUseCase(secureCredentialStore),
		clearCredential: new ClearOnlineCredentialUseCase(secureCredentialStore),
		unlockCredential: new UnlockOnlineCredentialUseCase(secureCredentialStore),
		prepareSave: new PrepareCredentialSaveUseCase(secureCredentialStore),
		prepareUnlock: new PrepareCredentialUnlockUseCase(secureCredentialStore),
		observeSavedCredential: new ObserveSavedCredentialStateUseCase(secureCredentialStore)
	};
}

export type CredentialServices = ReturnType<typeof createCredentialServices>;
