type ClientCapabilities = Record<string, boolean>;

export async function isPrfProtectionAvailable(): Promise<boolean> {
	if (typeof window === 'undefined' || !window.PublicKeyCredential) {
		return false;
	}

	const credentialCtor = PublicKeyCredential as typeof PublicKeyCredential & {
		getClientCapabilities?: () => Promise<ClientCapabilities>;
	};

	if (!credentialCtor.isUserVerifyingPlatformAuthenticatorAvailable) {
		return false;
	}

	const uvAvailable = await credentialCtor.isUserVerifyingPlatformAuthenticatorAvailable();
	if (!uvAvailable) {
		return false;
	}

	if (credentialCtor.getClientCapabilities) {
		const capabilities = await credentialCtor.getClientCapabilities();
		return capabilities['extension.prf'] === true;
	}

	return false;
}

export function isAccountOnlyFallbackAvailable(): boolean {
	return typeof localStorage !== 'undefined';
}
