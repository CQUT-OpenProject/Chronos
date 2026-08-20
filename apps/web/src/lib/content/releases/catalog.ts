import type { AppResult } from '$lib/domain/result/app-result';
import type { Release } from './release';
export interface ReleaseCatalog {
	listReleases(): Promise<AppResult<Release[]>>;
	getRelease(tag: string): Promise<AppResult<Release>>;
}
