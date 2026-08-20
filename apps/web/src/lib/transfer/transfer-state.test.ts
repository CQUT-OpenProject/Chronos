import { describe, expect, it, beforeEach, vi } from 'vite-plus/test';
import {
	canSaveCredentials,
	createTransferState,
	saveCredentialsLabel
} from './transfer-state.svelte';
import type { SavedCredentialState } from '$lib/models/auth';
import type { CredentialServices } from '$lib/client/credential-services';
import type { SecureCredentialStore } from '$lib/client/webauthn-secure-credential-store';

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
		const mockCredentialServices = {
			secureCredentialStore: {
				subscribeSavedCredentialState: () => () => {}
			} as unknown as SecureCredentialStore
		} satisfies CredentialServices;

		const controller = createTransferState(mockCredentialServices);

		mockStorage['chronos:import-preview'] = JSON.stringify({ name: 'Test' });
		mockStorage['chronos:import-preview-source'] = 'SHARE_LINK';

		controller.loadPersistedPreview();
		expect(controller.state.preview).toEqual({ name: 'Test' });
		expect(controller.state.previewSource).toBe('SHARE_LINK');

		controller.clearPreview();
		expect(controller.state.preview).toBeNull();
		expect(mockStorage['chronos:import-preview']).toBeUndefined();
	});

	it('clears sessionStorage when clearPersistedPreview is called', () => {
		const mockCredentialServices = {
			secureCredentialStore: {
				subscribeSavedCredentialState: () => () => {}
			} as unknown as SecureCredentialStore
		} satisfies CredentialServices;

		const controller = createTransferState(mockCredentialServices);

		mockStorage['chronos:import-preview'] = JSON.stringify({ name: 'Test' });
		mockStorage['chronos:import-preview-source'] = 'SHARE_LINK';

		controller.clearPersistedPreview();
		expect(mockStorage['chronos:import-preview']).toBeUndefined();
		expect(mockStorage['chronos:import-preview-source']).toBeUndefined();
	});
});

describe('credential copy helpers', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {}
		});
	});

	const baseState: SavedCredentialState = {
		account: null,
		hasSavedCredential: false,
		protectionAvailable: false,
		capabilitiesReady: false,
		savedMode: null
	};

	it('shows detecting label before capabilities are ready', () => {
		expect(saveCredentialsLabel(baseState)).toBe('正在检测设备能力…');
		expect(canSaveCredentials(baseState)).toBe(false);
	});

	it('shows full save label when PRF is available', () => {
		const state: SavedCredentialState = {
			...baseState,
			capabilitiesReady: true,
			protectionAvailable: true
		};
		expect(saveCredentialsLabel(state)).toBe('安全保存凭据');
		expect(canSaveCredentials(state)).toBe(true);
	});

	it('shows account-only label when PRF is unavailable', () => {
		const state: SavedCredentialState = {
			...baseState,
			capabilitiesReady: true,
			protectionAvailable: false
		};
		expect(saveCredentialsLabel(state)).toBe('仅保存账号');
		expect(canSaveCredentials(state)).toBe(true);
	});
});
