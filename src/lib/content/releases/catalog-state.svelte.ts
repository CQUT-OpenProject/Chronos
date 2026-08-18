import type { Release } from './release';
import { normalizeReleaseTag } from './release';
import type { ReleaseCatalog } from './catalog';
import { createLocalReleaseCatalog } from './local-catalog';

export interface ReleaseListState {
	loading: boolean;
	releases: Release[];
	errorMessage: string | null;
}

export interface ReleaseDetailState {
	loading: boolean;
	release: Release | null;
	errorMessage: string | null;
}

export function createReleaseListState(catalog: ReleaseCatalog = createLocalReleaseCatalog()) {
	let loading = $state(true);
	let releases = $state<Release[]>([]);
	let errorMessage = $state<string | null>(null);

	async function load() {
		loading = true;
		errorMessage = null;
		const result = await catalog.listReleases();
		loading = false;
		if (result.ok) {
			releases = result.value;
		} else {
			releases = [];
			errorMessage = result.error.message;
		}
	}

	const state = $derived({
		loading,
		releases,
		errorMessage
	} satisfies ReleaseListState);

	return {
		get state() {
			return state;
		},
		load
	};
}

export type ReleaseListStateController = ReturnType<typeof createReleaseListState>;

export function createReleaseDetailState(
	getTag: () => string,
	catalog: ReleaseCatalog = createLocalReleaseCatalog()
) {
	let loading = $state(true);
	let release = $state<Release | null>(null);
	let errorMessage = $state<string | null>(null);

	async function load() {
		loading = true;
		errorMessage = null;
		const result = await catalog.getRelease(normalizeReleaseTag(getTag()));
		loading = false;
		if (result.ok) {
			release = result.value;
		} else {
			release = null;
			errorMessage = result.error.message;
		}
	}

	const state = $derived({
		loading,
		release,
		errorMessage
	} satisfies ReleaseDetailState);

	return {
		get state() {
			return state;
		},
		load
	};
}

export type ReleaseDetailStateController = ReturnType<typeof createReleaseDetailState>;
