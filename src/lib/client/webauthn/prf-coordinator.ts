import { bytesToBase64, base64ToBytes } from './binary';

const RP_NAME = 'Chronos';

interface PrfClientExtensionResults {
	prf?: {
		enabled?: boolean;
		results?: {
			first?: ArrayBuffer;
			second?: ArrayBuffer;
		};
	};
}

function rpId(): string {
	if (typeof window === 'undefined') return 'localhost';
	return window.location.hostname || 'localhost';
}

function readPrfOutput(credential: PublicKeyCredential): Uint8Array | null {
	const extensions = credential.getClientExtensionResults() as PrfClientExtensionResults;
	const first = extensions.prf?.results?.first;
	return first ? new Uint8Array(first) : null;
}

function toBufferSource(bytes: Uint8Array): BufferSource {
	return new Uint8Array(bytes);
}

export async function createPrfCredential(salt: Uint8Array): Promise<{
	credentialId: string;
	prfOutput: string;
}> {
	const credential = (await navigator.credentials.create({
		publicKey: {
			challenge: crypto.getRandomValues(new Uint8Array(32)),
			rp: { name: RP_NAME, id: rpId() },
			user: {
				id: crypto.getRandomValues(new Uint8Array(16)),
				name: 'chronos-online-credential',
				displayName: 'Chronos Online Credential'
			},
			pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
			authenticatorSelection: {
				authenticatorAttachment: 'platform',
				userVerification: 'required',
				residentKey: 'discouraged',
				requireResidentKey: false
			},
			extensions: {
				prf: { eval: { first: toBufferSource(salt) } }
			}
		}
	})) as PublicKeyCredential | null;

	if (!credential) {
		throw new Error('WebAuthn registration was cancelled');
	}

	const prfOutput = readPrfOutput(credential);
	if (!prfOutput) {
		throw new Error('WebAuthn PRF output missing');
	}

	return {
		credentialId: bytesToBase64(new Uint8Array(credential.rawId)),
		prfOutput: bytesToBase64(prfOutput)
	};
}

export class WebAuthnCredentialUnavailableError extends Error {
	constructor(message = 'WebAuthn credential not found') {
		super(message);
		this.name = 'WebAuthnCredentialUnavailableError';
	}
}

export async function getPrfOutput(
	saltBase64: string,
	credentialIdBase64: string
): Promise<string> {
	const salt = base64ToBytes(saltBase64);
	const credentialId = base64ToBytes(credentialIdBase64);

	let credential: PublicKeyCredential | null;
	try {
		credential = (await navigator.credentials.get({
			publicKey: {
				challenge: crypto.getRandomValues(new Uint8Array(32)),
				rpId: rpId(),
				// Platform-only: matches create() authenticatorAttachment and avoids hybrid QR
				// fallback when the local passkey was deleted from the password manager.
				allowCredentials: [
					{
						id: toBufferSource(credentialId),
						type: 'public-key',
						transports: ['internal']
					}
				],
				userVerification: 'required',
				extensions: {
					prf: { eval: { first: toBufferSource(salt) } }
				}
			}
		})) as PublicKeyCredential | null;
	} catch (error) {
		const name = error instanceof DOMException ? error.name : 'unknown';
		// Chrome reports both "no passkeys" (after closing that dialog) and UV cancel as
		// NotAllowedError — we cannot tell them apart, so treat as invalidated and clear.
		if (name === 'NotFoundError' || name === 'NotAllowedError') {
			throw new WebAuthnCredentialUnavailableError();
		}
		if (name === 'AbortError') {
			throw new Error('WebAuthn verification was cancelled', { cause: error });
		}
		throw error;
	}

	if (!credential) {
		throw new WebAuthnCredentialUnavailableError();
	}

	const prfOutput = readPrfOutput(credential);
	if (!prfOutput) {
		throw new Error('WebAuthn PRF output missing');
	}

	return bytesToBase64(prfOutput);
}
