import { describe, expect, it, beforeEach, vi } from 'vite-plus/test';
import {
	canSaveCredentials,
	createTransferState,
	saveCredentialsLabel,
	savedCredentialHint
} from './transfer-state.svelte';
import type { SavedCredentialState } from '$lib/models/auth';
import type { TransferServices } from '$lib/client/transfer-services';
import type { CredentialServices } from '$lib/client/credential-services';
import type { SecureCredentialStore } from '$lib/domain/interfaces/secure-credential-store';

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
			secureCredentialStore: {
				subscribeSavedCredentialState: () => () => {}
			} as unknown as SecureCredentialStore
		} satisfies CredentialServices;

		const controller = createTransferState(mockTransferServices, mockCredentialServices);

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
		const mockTransferServices = {
			previewImported: {} as unknown as TransferServices['previewImported'],
			previewOnline: {} as unknown as TransferServices['previewOnline'],
			importTimetable: {} as unknown as TransferServices['importTimetable'],
			exportCurrent: {} as unknown as TransferServices['exportCurrent']
		} satisfies TransferServices;

		const mockCredentialServices = {
			secureCredentialStore: {
				subscribeSavedCredentialState: () => () => {}
			} as unknown as SecureCredentialStore
		} satisfies CredentialServices;

		const controller = createTransferState(mockTransferServices, mockCredentialServices);

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
		expect(saveCredentialsLabel(state)).toBe('保存帐号密码');
		expect(canSaveCredentials(state)).toBe(true);
	});

	it('shows account-only label when PRF is unavailable', () => {
		const state: SavedCredentialState = {
			...baseState,
			capabilitiesReady: true,
			protectionAvailable: false
		};
		expect(saveCredentialsLabel(state)).toBe('保存账号（密码需每次输入）');
		expect(canSaveCredentials(state)).toBe(true);
	});

	it('returns saved credential hints by mode', () => {
		expect(
			savedCredentialHint({
				...baseState,
				hasSavedCredential: true,
				savedMode: 'prf'
			})
		).toBe('每次使用前都会触发设备验证。');

		expect(
			savedCredentialHint({
				...baseState,
				hasSavedCredential: true,
				savedMode: 'account_only'
			})
		).toBe('仅保存了账号，预览时仍需输入密码。');
	});
});
