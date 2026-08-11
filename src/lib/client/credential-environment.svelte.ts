import { isPrfProtectionAvailable } from '$lib/client/webauthn/prf-support';
import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord
} from '$lib/storage/online-credential-record';
import { SvelteSet } from 'svelte/reactivity';

async function sanitizeOnlineCredentialAtStartup(
	storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null
): Promise<void> {
	const record = readOnlineCredentialRecord(storage);
	if (!record || record.mode !== 'prf') return;

	const prfAvailable = await isPrfProtectionAvailable();
	if (!prfAvailable) {
		writeOnlineCredentialRecord(null, storage);
	}
}

export class CredentialEnvironmentController {
	prfAvailable = $state(false);
	ready = $state(false);

	private initialized = false;
	private initPromise: Promise<void> | null = null;
	private listeners = new SvelteSet<() => void>();

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	init(): Promise<void> {
		if (this.initPromise) return this.initPromise;

		this.initPromise = this.detect();
		return this.initPromise;
	}

	private async detect(): Promise<void> {
		if (this.initialized || typeof window === 'undefined') return;
		this.initialized = true;

		this.prfAvailable = await isPrfProtectionAvailable();
		await sanitizeOnlineCredentialAtStartup();
		this.ready = true;
		this.notify();
	}

	private notify() {
		for (const listener of this.listeners) {
			listener();
		}
	}
}

export const credentialEnvironment = new CredentialEnvironmentController();
