export interface AuthSnapshot {
	account: string;
	password: string;
}

export interface SavedCredentialState {
	account: string | null;
	hasSavedCredential: boolean;
	protectionAvailable: boolean;
}
