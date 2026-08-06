export interface AuthSnapshot {
	account: string;
	password: string;
}

export interface SavedCredentialState {
	account: string | null;
	hasSavedCredential: boolean;
	protectionAvailable: boolean;
}

export interface GithubRelease {
	tagName: string;
	name: string;
	publishedAt: string;
	body: string;
	htmlUrl: string;
}

export interface GithubContributor {
	login: string;
	avatarUrl: string;
	htmlUrl: string;
	contributions: number;
}
