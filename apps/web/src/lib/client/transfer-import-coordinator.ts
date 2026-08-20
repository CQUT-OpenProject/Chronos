import { ImportMode } from '$lib/domain/import-mode';
import type { SavedCredentialState } from '$lib/models/auth';
import type { CqutCampusId } from '$lib/models/cqut-campus';
import { getCampusDefaultPeriodTimes } from '$lib/models/cqut-campus';
import type { Timetable } from '$lib/models/timetable';
import { TimetableImportSource } from '$lib/models/timetable';
import {
	createSessionPreviewPersistence,
	type PreviewPersistence,
	type PreviewSnapshot,
	type TransferImportSource
} from './preview-persistence';
import { ChronosTimetableShareLinkCodec } from '$lib/parsers/share-link/chronos-timetable-share-link-codec';
import { type CredentialVault } from './credential-vault';
import { SHARE_LINK_WARNING_LENGTH } from '$lib/parsers/share-link/chronos-share-link-codec';
import type { ChronosEngine } from '@chronos/core';

export type { TransferImportSource };

export type IngestStrategy = 'share-link' | 'json-slot' | 'html' | 'online';

export interface ClipboardGateway {
	readText(): Promise<string>;
	writeText(text: string): Promise<void>;
}

export function createNavigatorClipboardGateway(): ClipboardGateway {
	return {
		readText: () => navigator.clipboard.readText(),
		writeText: (text) => navigator.clipboard.writeText(text)
	};
}

export type PreviewOutcome =
	| { ok: true; preview: Timetable; source: TransferImportSource }
	| { ok: false; errorMessage: string };

export type OnlinePreviewOutcome =
	| {
			ok: true;
			preview: Timetable;
			source: 'ONLINE';
			account?: string;
			password?: string;
			statusMessage?: string;
	  }
	| { ok: false; errorMessage: string };

export type ImportOutcome = { ok: true } | { ok: false; errorMessage: string };

export type ExportOutcome =
	| { ok: true; statusMessage: string }
	| { ok: false; errorMessage: string };

export type ClearCredentialOutcome =
	| { ok: true; statusMessage: string }
	| { ok: false; errorMessage: string };

export interface IIngestCoordinator {
	previewFromClipboard(): Promise<PreviewOutcome>;
	previewFromHtmlFile(file: File): Promise<PreviewOutcome>;
	previewOnline(
		account: string,
		password: string,
		saveCredentials: boolean
	): Promise<OnlinePreviewOutcome>;
	previewWithSavedCredential(
		savedCredentialState: SavedCredentialState
	): Promise<OnlinePreviewOutcome>;
	clearSavedCredential(): Promise<ClearCredentialOutcome>;
	persistPreview(snapshot: PreviewSnapshot): boolean;
	loadPersistedPreview(): PreviewSnapshot | null;
	clearPersistedPreview(): void;
	confirmImport(
		preview: Timetable,
		previewSource: TransferImportSource,
		importMode: ImportMode,
		htmlImportTermStartDate: string | null,
		htmlImportCampusId: CqutCampusId | null
	): Promise<ImportOutcome>;
	exportToClipboard(): Promise<ExportOutcome>;
	getExportMetadata(): Promise<{ timetableName: string | null; longLinkWarning: boolean }>;
}

export interface TransferImportCoordinatorDeps {
	credentialVault: CredentialVault;
	previewPersistence?: PreviewPersistence;
	clipboard?: ClipboardGateway;
	shareLinkCodec?: ChronosTimetableShareLinkCodec;
	engine?: ChronosEngine;
}

const SLOT_IDS: Record<IngestStrategy, string> = {
	'share-link': 'share-link',
	'json-slot': 'share-json',
	html: 'edu-html',
	online: 'cqut-online'
};

function asTimetable(value: unknown): Timetable | null {
	if (!value || typeof value !== 'object') return null;
	const timetable = value as Timetable;
	if (!Array.isArray(timetable.courses)) return null;
	return timetable;
}

export function createTransferImportCoordinator({
	credentialVault,
	previewPersistence = createSessionPreviewPersistence(),
	clipboard = createNavigatorClipboardGateway(),
	shareLinkCodec = new ChronosTimetableShareLinkCodec(),
	engine
}: TransferImportCoordinatorDeps): IIngestCoordinator {
	const getEngine = () => {
		if (!engine) {
			throw new Error('ChronosEngine is required for ingest');
		}
		return engine;
	};

	function getImportSlot(strategy: IngestStrategy) {
		return getEngine().slots.getSlotItem('import.source.tab', SLOT_IDS[strategy]);
	}

	async function executeSlotImport(
		strategy: IngestStrategy,
		pluginId: string,
		inputs: Record<string, unknown>
	): Promise<Timetable> {
		const source = getImportSlot(strategy);
		if (!source) {
			throw new Error(`缺少导入槽位：${SLOT_IDS[strategy]}`);
		}
		const ctx = getEngine().getPluginContext(pluginId);
		const timetable = asTimetable(await source.executeImport(inputs, ctx));
		if (!timetable) {
			throw new Error('导入结果不是有效课表');
		}
		return timetable;
	}

	async function previewFromClipboard(): Promise<PreviewOutcome> {
		try {
			const content = await clipboard.readText();
			const trimmed = content.trim();
			if (!trimmed) {
				return { ok: false, errorMessage: '剪贴板内容为空' };
			}

			if (getImportSlot('share-link')) {
				try {
					const timetable = await executeSlotImport('share-link', 'codec-share', {
						content: trimmed,
						fileContent: trimmed
					});
					return { ok: true, preview: timetable, source: 'SHARE_LINK' };
				} catch {
					// fall through to JSON backup slot
				}
			}

			if (!getImportSlot('json-slot')) {
				return { ok: false, errorMessage: '无效的课表分享内容' };
			}

			const timetable = await executeSlotImport('json-slot', 'codec-share', {
				file: trimmed,
				content: trimmed,
				fileContent: trimmed
			});
			if (timetable.courses.length > 0) {
				return { ok: true, preview: timetable, source: 'SHARE_LINK' };
			}

			return { ok: false, errorMessage: '无效的课表分享内容' };
		} catch (err) {
			const message = err instanceof Error ? err.message : '无法读取剪贴板，请检查浏览器权限';
			if (message.startsWith('缺少导入槽位')) {
				return { ok: false, errorMessage: message };
			}
			if (message === '无法读取剪贴板，请检查浏览器权限' || message.includes('clipboard')) {
				return { ok: false, errorMessage: '无法读取剪贴板，请检查浏览器权限' };
			}
			return { ok: false, errorMessage: message };
		}
	}

	async function previewFromHtmlFile(file: File): Promise<PreviewOutcome> {
		try {
			const text = await file.text();
			const timetable = await executeSlotImport('html', 'parser-html', {
				file: text,
				fileContent: text
			});
			if (timetable.courses.length === 0) {
				return { ok: false, errorMessage: 'HTML 文件中未识别到任何有效课程' };
			}
			return { ok: true, preview: timetable, source: 'HTML' };
		} catch (err) {
			const msg = err instanceof Error ? err.message : '解析 HTML 课表失败';
			return { ok: false, errorMessage: msg };
		}
	}

	async function saveCredentialsIfNeeded(
		trimmedAccount: string,
		currentPassword: string,
		saveCredentials: boolean
	): Promise<string | null> {
		if (!saveCredentials) return null;
		const result = await credentialVault.save(trimmedAccount, currentPassword);
		if (!result.ok) {
			return result.error.message === '已取消设备验证'
				? '已获取预览，未保存凭据'
				: result.error.message;
		}
		return null;
	}

	async function previewOnline(
		account: string,
		password: string,
		saveCredentials: boolean
	): Promise<OnlinePreviewOutcome> {
		const trimmedAccount = account.trim();
		if (!trimmedAccount || !password.trim()) {
			return { ok: false, errorMessage: '请输入账号和密码' };
		}

		try {
			const timetable = await executeSlotImport('online', 'source-cqut', {
				username: trimmedAccount,
				account: trimmedAccount,
				password
			});
			if (timetable.courses.length === 0) {
				return { ok: false, errorMessage: '未能获取到有效课程数据，请检查学号与密码' };
			}

			const statusMessage = await saveCredentialsIfNeeded(
				trimmedAccount,
				password,
				saveCredentials
			);

			return {
				ok: true,
				preview: timetable,
				source: 'ONLINE',
				statusMessage: statusMessage ?? undefined
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : '连接教务系统失败，请检查网络连接';
			return { ok: false, errorMessage: message };
		}
	}

	async function previewWithSavedCredential(
		savedCredentialState: SavedCredentialState
	): Promise<OnlinePreviewOutcome> {
		if (!savedCredentialState.hasSavedCredential) {
			return { ok: false, errorMessage: '当前没有可用的已保存凭据' };
		}

		const unlockResult = await credentialVault.unlock();
		if (!unlockResult.ok) {
			return { ok: false, errorMessage: unlockResult.error.message };
		}

		const previewResult = await previewOnline(
			unlockResult.value.account,
			unlockResult.value.password,
			false
		);
		if (!previewResult.ok) {
			return previewResult;
		}

		return {
			...previewResult,
			account: unlockResult.value.account,
			password: unlockResult.value.password
		};
	}

	async function clearSavedCredential(): Promise<ClearCredentialOutcome> {
		const result = await credentialVault.clear();
		if (!result.ok) {
			return { ok: false, errorMessage: result.error.message };
		}
		return { ok: true, statusMessage: '已清除保存的凭据' };
	}

	function persistPreview(snapshot: PreviewSnapshot): boolean {
		previewPersistence.save(snapshot);
		return true;
	}

	function loadPersistedPreview(): PreviewSnapshot | null {
		return previewPersistence.load();
	}

	function clearPersistedPreview(): void {
		previewPersistence.clear();
	}

	async function confirmImport(
		preview: Timetable,
		previewSource: TransferImportSource,
		importMode: ImportMode,
		htmlImportTermStartDate: string | null,
		htmlImportCampusId: CqutCampusId | null
	): Promise<ImportOutcome> {
		let finalPreview = preview;
		if (previewSource === 'HTML') {
			if (!htmlImportTermStartDate) {
				return { ok: false, errorMessage: '请选择学期起始日期' };
			}
			if (!htmlImportCampusId) {
				return { ok: false, errorMessage: '请选择校区' };
			}
			const periodTimes = getCampusDefaultPeriodTimes(htmlImportCampusId);
			finalPreview = {
				...preview,
				academicConfig: {
					...preview.academicConfig,
					termStartDate: htmlImportTermStartDate,
					periodTimes
				},
				importMetadata: {
					source: preview.importMetadata?.source ?? TimetableImportSource.FILE_HTML,
					campusId: htmlImportCampusId
				},
				customMetadata: {
					...preview.customMetadata,
					'core.import': {
						source: 'FILE_HTML',
						campusId: htmlImportCampusId
					}
				}
			};
		}

		try {
			await getEngine().actions.importTimetable(finalPreview, {
				overwriteActive: importMode === ImportMode.OVERWRITE_CURRENT
			});
			return { ok: true };
		} catch (err) {
			const msg = err instanceof Error ? err.message : '保存课表失败';
			return { ok: false, errorMessage: msg };
		}
	}

	async function exportToClipboard(): Promise<ExportOutcome> {
		const current = getEngine().state.currentTimetable;
		if (!current) {
			return { ok: false, errorMessage: '当前没有可导出的课表' };
		}
		const exportSlot = getEngine().slots.getSlotItem('export.action', 'share-link');
		if (!exportSlot) {
			return { ok: false, errorMessage: '分享链接导出不可用' };
		}
		try {
			const ctx = getEngine().getPluginContext('codec-share');
			const result = await exportSlot.export(current, ctx);
			const text = typeof result.content === 'string' ? result.content : '';
			await clipboard.writeText(text);
			return { ok: true, statusMessage: '已复制课表链接' };
		} catch (err) {
			const msg = err instanceof Error ? err.message : '课表导出失败';
			return { ok: false, errorMessage: msg };
		}
	}

	async function getExportMetadata() {
		const current = getEngine().state.currentTimetable;
		if (!current) {
			return { timetableName: null, longLinkWarning: false };
		}
		const length = await shareLinkCodec.estimatePayloadLength(current);
		return {
			timetableName: current.name,
			longLinkWarning: length > SHARE_LINK_WARNING_LENGTH
		};
	}

	return {
		previewFromClipboard,
		previewFromHtmlFile,
		previewOnline,
		previewWithSavedCredential,
		clearSavedCredential,
		persistPreview,
		loadPersistedPreview,
		clearPersistedPreview,
		confirmImport,
		exportToClipboard,
		getExportMetadata
	};
}

export type TransferImportCoordinator = IIngestCoordinator;
