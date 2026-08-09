import { describe, expect, it, vi } from 'vite-plus/test';
import { ImportMode } from '$lib/domain/import-mode';
import { success } from '$lib/domain/result/app-result';
import { createSessionPreviewPersistence } from './preview-persistence';
import { createTransferImportCoordinator } from './transfer-import-coordinator';
import type { TransferServices } from './transfer-services';
import { formatShareClipboardText } from '$lib/parsers/share-link/chronos-share-link-codec';
import type { SecureCredentialStore } from '$lib/domain/interfaces/secure-credential-store';

describe('createTransferImportCoordinator', () => {
	it('persists and loads preview snapshot via preview persistence', () => {
		const storage: Record<string, string> = {};
		const mockStorage = {
			getItem: (key: string) => storage[key] ?? null,
			setItem: (key: string, value: string) => {
				storage[key] = value;
			},
			removeItem: (key: string) => {
				delete storage[key];
			}
		};

		const coordinator = createTransferImportCoordinator({
			services: {} as TransferServices,
			secureCredentialStore: {} as SecureCredentialStore,
			previewPersistence: createSessionPreviewPersistence(mockStorage)
		});

		const timetable = { name: 'Test Timetable' } as never;
		coordinator.persistPreview({
			preview: timetable,
			previewSource: 'SHARE_LINK',
			importMode: ImportMode.AS_NEW,
			htmlImportTermStartDate: null
		});

		expect(coordinator.loadPersistedPreview()).toEqual({
			preview: timetable,
			previewSource: 'SHARE_LINK',
			importMode: ImportMode.AS_NEW,
			htmlImportTermStartDate: null
		});

		coordinator.clearPersistedPreview();
		expect(coordinator.loadPersistedPreview()).toBeNull();
	});

	it('reads clipboard and previews share link text', async () => {
		const invoke = vi.fn().mockResolvedValue(success({ name: 'From Share Link' }));
		const mockStorage: Record<string, string> = {};

		const coordinator = createTransferImportCoordinator({
			services: {
				previewImported: { invoke }
			} as unknown as TransferServices,
			secureCredentialStore: {} as SecureCredentialStore,
			previewPersistence: createSessionPreviewPersistence({
				getItem: (key) => mockStorage[key] ?? null,
				setItem: (key, value) => {
					mockStorage[key] = value;
				},
				removeItem: (key) => {
					delete mockStorage[key];
				}
			}),
			clipboard: {
				readText: async () => '  https://chronos.test/s#1.abc  ',
				writeText: async () => {}
			}
		});

		const result = await coordinator.previewFromClipboard();
		expect(result).toEqual({
			ok: true,
			preview: { name: 'From Share Link' },
			source: 'SHARE_LINK'
		});
		expect(invoke).toHaveBeenCalledWith('https://chronos.test/s#1.abc');
	});

	it('exports share link to clipboard', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		const clipboardText = formatShareClipboardText('知行理工', 'https://chronos.test/s#1.abc');
		const coordinator = createTransferImportCoordinator({
			services: {
				exportCurrent: {
					invoke: vi.fn().mockResolvedValue(success(clipboardText))
				}
			} as unknown as TransferServices,
			secureCredentialStore: {} as SecureCredentialStore,
			clipboard: {
				readText: async () => '',
				writeText
			}
		});

		const result = await coordinator.exportToClipboard();
		expect(result).toEqual({ ok: true, statusMessage: '已复制课表链接' });
		expect(writeText).toHaveBeenCalledWith(clipboardText);
	});
});
