export interface AuthSnapshot {
	account: string;
	password: string;
}

export type SavedCredentialMode = 'account_only' | 'vault';

export interface SavedCredentialState {
	account: string | null;
	hasSavedCredential: boolean;
	protectionAvailable: boolean;
	capabilitiesReady: boolean;
	savedMode: SavedCredentialMode | null;
}
