import type { AppResult } from '$lib/domain/result/app-result';
import type { Release } from './release';
import { createLocalReleaseCatalog } from './local-catalog';

export interface ReleaseCatalog {
	listReleases(): Promise<AppResult<Release[]>>;
	getRelease(tag: string): Promise<AppResult<Release>>;
}

export function createReleaseCatalog(
	adapter: ReleaseCatalog = createLocalReleaseCatalog()
): ReleaseCatalog {
	return adapter;
}
