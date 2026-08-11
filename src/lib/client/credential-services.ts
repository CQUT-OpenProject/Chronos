import { createWebAuthnSecureCredentialStore } from './webauthn-secure-credential-store';

export function createCredentialServices(
	secureCredentialStore = createWebAuthnSecureCredentialStore()
) {
	return { secureCredentialStore };
}

export type CredentialServices = ReturnType<typeof createCredentialServices>;
