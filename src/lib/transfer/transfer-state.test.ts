import { describe, expect, it, beforeEach, vi } from 'vite-plus/test';
import { createTransferState } from './transfer-state.svelte';
import type { TransferServices } from '$lib/client/transfer-services';
import type { CredentialServices } from '$lib/client/credential-services';

describe('createTransferState', () => {
	let mockStorage: Record<string, string> = {};

	beforeEach(() => {
		mockStorage = {};
		vi.stubGlobal('sessionStorage', {
			getItem: (key: string) => mockStorage[key] ?? null,
			setItem: (key: string, value: string) => {
				mockStorage[key] = value;
			},
			removeItem: (key: string) => {
				delete mockStorage[key];
			}
		});
	});

	it('clears preview from memory and sessionStorage when clearPreview is called', () => {
		const mockTransferServices = {
			previewImported: {} as unknown as TransferServices['previewImported'],
			previewOnline: {} as unknown as TransferServices['previewOnline'],
			importTimetable: {} as unknown as TransferServices['importTimetable'],
			exportCurrent: {} as unknown as TransferServices['exportCurrent']
		} satisfies TransferServices;

		const mockCredentialServices = {
			secureCredentialStore: {} as unknown as CredentialServices['secureCredentialStore'],
			observeSavedCredential: {
				subscribe: () => ({ unsubscribe: () => {} })
			} as unknown as CredentialServices['observeSavedCredential'],
			prepareSave: {} as unknown as CredentialServices['prepareSave'],
			saveCredential: {} as unknown as CredentialServices['saveCredential'],
			prepareUnlock: {} as unknown as CredentialServices['prepareUnlock'],
			unlockCredential: {} as unknown as CredentialServices['unlockCredential'],
			clearCredential: {} as unknown as CredentialServices['clearCredential']
		} satisfies CredentialServices;

		const controller = createTransferState(mockTransferServices, mockCredentialServices);

		mockStorage['chronos:import-preview'] = JSON.stringify({ name: 'Test' });
		mockStorage['chronos:import-preview-source'] = 'JSON';

		controller.loadPersistedPreview();
		expect(controller.state.preview).toEqual({ name: 'Test' });

		controller.clearPreview();
		expect(controller.state.preview).toBeNull();
		expect(mockStorage['chronos:import-preview']).toBeUndefined();
	});
});
