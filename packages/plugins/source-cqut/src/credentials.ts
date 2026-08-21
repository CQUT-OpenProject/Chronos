export const SOURCE_CQUT_PLUGIN_ID = 'source-cqut';
export const CQUT_PASSWORD_SECRET_KEY = `${SOURCE_CQUT_PLUGIN_ID}:password`;
export const CQUT_CREDENTIAL_RECORD_KEY = 'credential-record';

export type CqutCredentialRecord =
	| { mode: 'vault'; account: string }
	| { mode: 'account_only'; account: string };
