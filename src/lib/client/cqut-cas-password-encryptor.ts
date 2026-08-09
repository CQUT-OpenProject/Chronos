const CHUNK_SIZE = 30;

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDACwPDxYycdCiNeblZa9LjvDzb
iZU1vc9gKRcG/pGjZ/DJkI4HmoUE2r/o6SfB5az3s+H5JDzmOMVQ63hD7LZQGR4k
3iYWnCg3UpQZkZEtFtXBXsQHjKVJqCiEtK+gtxz4WnriDjf+e/CxJ7OD03e7sy5N
Y/akVmYNtghKZzz6jwIDAQAB
-----END PUBLIC KEY-----`;

export async function encryptCasPassword(password: string): Promise<string> {
	if (!password.trim()) return '';

	const { default: JSEncrypt } = await import('jsencrypt');
	const encryptor = new JSEncrypt();
	encryptor.setPublicKey(PUBLIC_KEY_PEM);

	const encryptedChunks: string[] = [];
	for (let i = 0; i < password.length; i += CHUNK_SIZE) {
		const chunk = password.slice(i, i + CHUNK_SIZE);
		const encrypted = encryptor.encrypt(chunk);
		if (!encrypted) {
			throw new Error('RSA encryption failed');
		}
		encryptedChunks.push(encrypted);
	}

	return encodeURIComponent(JSON.stringify(encryptedChunks));
}
