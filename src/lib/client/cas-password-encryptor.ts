import { encryptCasPassword } from './cqut-cas-password-encryptor';

export interface CasPasswordEncryptor {
	encrypt(password: string): Promise<string>;
}

export function createCqutCasPasswordEncryptor(): CasPasswordEncryptor {
	return {
		encrypt: encryptCasPassword
	};
}
