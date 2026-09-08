import type { AppResult } from '@chronos/core';
import type { Release } from './release';
export interface ReleaseCatalog {
	listReleases(): Promise<AppResult<Release[]>>;
	getRelease(tag: string): Promise<AppResult<Release>>;
}
