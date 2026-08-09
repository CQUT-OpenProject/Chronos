import { encryptCasPassword } from './cqut-cas-password-encryptor';

export interface CasPasswordEncryptor {
	encrypt(password: string): string;
}

export function createCqutCasPasswordEncryptor(): CasPasswordEncryptor {
	return {
		encrypt: encryptCasPassword
	};
}
