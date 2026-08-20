import { ImportMode } from '$lib/domain/import-mode';
import type { SavedCredentialState } from '$lib/models/auth';
import type { CqutCampusId } from '$lib/models/cqut-campus';
import { getCampusDefaultPeriodTimes } from '$lib/models/cqut-campus';
import type { Timetable } from '$lib/models/timetable';
import {
	createPrfCredential,
	getPrfOutput,
	WebAuthnCredentialUnavailableError
} from '$lib/client/webauthn/prf-coordinator';
import { base64ToBytes } from '$lib/client/webauthn/binary';
import {
	createSessionPreviewPersistence,
	type PreviewPersistence,
	type PreviewSnapshot,
	type TransferImportSource
} from './preview-persistence';
import { getAppEngine } from '$lib/services/app-engine';
import { ChronosTimetableShareLinkCodec } from '$lib/parsers/share-link/chronos-timetable-share-link-codec';
import { parseHtmlTimetable } from '@chronos/plugin-parser-html';
import { parseCqutScheduleData } from '@chronos/plugin-source-cqut';
import {
	type SecureCredentialStore,
	WebAuthnSecureCredentialStore
} from './webauthn-secure-credential-store';
import { SHARE_LINK_WARNING_LENGTH } from '$lib/parsers/share-link/chronos-share-link-codec';
import type { ChronosEngine } from '@chronos/core';

export type { TransferImportSource };

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

interface UnlockPreparePayload {
	salt: string;
	credentialId: string;
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

export interface TransferImportCoordinatorDeps {
	secureCredentialStore?: SecureCredentialStore;
	previewPersistence?: PreviewPersistence;
	clipboard?: ClipboardGateway;
	shareLinkCodec?: ChronosTimetableShareLinkCodec;
	engine?: ChronosEngine;
}

export function createTransferImportCoordinator({
	secureCredentialStore = new WebAuthnSecureCredentialStore(),
	previewPersistence = createSessionPreviewPersistence(),
	clipboard = createNavigatorClipboardGateway(),
	shareLinkCodec = new ChronosTimetableShareLinkCodec(),
	engine
}: TransferImportCoordinatorDeps = {}) {
	const getEngine = () => engine ?? getAppEngine();

	async function previewFromClipboard(): Promise<PreviewOutcome> {
		try {
			const content = await clipboard.readText();
			const trimmed = content.trim();
			if (!trimmed) {
				return { ok: false, errorMessage: '剪贴板内容为空' };
			}

			// 1. Decode share link
			const result = await shareLinkCodec.decode(trimmed);
			if (result.ok) {
				return { ok: true, preview: result.value, source: 'SHARE_LINK' };
			}

			// 2. Decode JSON backup source if slot available
			const jsonSource = getEngine().slots.getSlotItem('import.source.tab', 'share-json');
			if (jsonSource) {
				try {
					const ctx = getEngine().getPluginContext('codec-share');
					const timetable = (await jsonSource.executeImport(
						{ file: trimmed, content: trimmed, fileContent: trimmed },
						ctx
					)) as unknown as Timetable;
					if (timetable && timetable.courses?.length > 0) {
						return { ok: true, preview: timetable, source: 'SHARE_LINK' };
					}
				} catch {
					// Fall through to error
				}
			}

			return { ok: false, errorMessage: result.error.message || '无效的课表分享内容' };
		} catch {
			return { ok: false, errorMessage: '无法读取剪贴板，请检查浏览器权限' };
		}
	}

	async function previewFromHtmlFile(file: File): Promise<PreviewOutcome> {
		try {
			const text = await file.text();
			const htmlSource =
				getEngine().slots.getSlotItem('import.source.tab', 'edu-html') ||
				getEngine().slots.getSlotItem('import.source.tab', 'html-parser');
			let timetable: Timetable;

			if (htmlSource) {
				const ctx = getEngine().getPluginContext('parser-html');
				timetable = (await htmlSource.executeImport(
					{ file: text, fileContent: text },
					ctx
				)) as unknown as Timetable;
			} else {
				timetable = parseHtmlTimetable(text) as unknown as Timetable;
			}

			if (!timetable || timetable.courses.length === 0) {
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
		saveCredentials: boolean,
		savedCredentialState: SavedCredentialState
	): Promise<string | null> {
		if (!saveCredentials) return null;

		if (savedCredentialState.protectionAvailable) {
			const prepareResult = await secureCredentialStore.prepareSave();
			if (!prepareResult.ok) {
				return prepareResult.error.message;
			}

			try {
				const created = await createPrfCredential(base64ToBytes(prepareResult.value));
				const saveResult = await secureCredentialStore.saveCredential(
					trimmedAccount,
					currentPassword,
					JSON.stringify({
						prf: created.prfOutput,
						credentialId: created.credentialId
					})
				);
				if (!saveResult.ok) {
					return saveResult.error.message;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : '已取消设备验证';
				return message === 'WebAuthn verification was cancelled' ||
					message === 'WebAuthn registration was cancelled'
					? '已获取预览，未保存凭据'
					: message;
			}
			return null;
		}
		const saveResult = await secureCredentialStore.saveCredential(trimmedAccount, '', '');
		if (!saveResult.ok) {
			return saveResult.error.message;
		}
		return null;
	}

	async function previewOnline(
		account: string,
		password: string,
		saveCredentials: boolean,
		savedCredentialState: SavedCredentialState
	): Promise<OnlinePreviewOutcome> {
		const trimmedAccount = account.trim();
		if (!trimmedAccount || !password.trim()) {
			return { ok: false, errorMessage: '请输入账号和密码' };
		}

		try {
			const source = getEngine().slots.getSlotItem('import.source.tab', 'cqut-online');
			let timetable: Timetable;

			if (source) {
				const ctx = getEngine().getPluginContext('source-cqut');
				timetable = (await source.executeImport(
					{
						username: trimmedAccount,
						account: trimmedAccount,
						password
					},
					ctx
				)) as unknown as Timetable;
			} else {
				const res = await fetch('/api/cqut/preview', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ account: trimmedAccount, password })
				});
				const data = (await res.json()) as {
					ok: boolean;
					payload?: unknown;
					value?: Timetable;
					error?: { message: string };
				};
				if (!data.ok) {
					return {
						ok: false,
						errorMessage: data.error?.message || '获取课表失败，请检查账号密码'
					};
				}
				timetable = (data.value ??
					parseCqutScheduleData(data.payload as never, trimmedAccount)) as Timetable;
			}

			if (!timetable || timetable.courses.length === 0) {
				return { ok: false, errorMessage: '未能获取到有效课程数据，请检查学号与密码' };
			}

			const statusMessage = await saveCredentialsIfNeeded(
				trimmedAccount,
				password,
				saveCredentials,
				savedCredentialState
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

		const prepareResult = await secureCredentialStore.prepareUnlock();
		if (!prepareResult.ok) {
			return { ok: false, errorMessage: prepareResult.error.message };
		}

		try {
			const payload = JSON.parse(prepareResult.value) as UnlockPreparePayload;
			const prfOutput = await getPrfOutput(payload.salt, payload.credentialId);
			const unlockResult = await secureCredentialStore.unlockCredential(
				JSON.stringify({ prf: prfOutput })
			);
			if (!unlockResult.ok) {
				return { ok: false, errorMessage: unlockResult.error.message };
			}

			const previewResult = await previewOnline(
				unlockResult.value.account,
				unlockResult.value.password,
				false,
				savedCredentialState
			);
			if (!previewResult.ok) {
				return previewResult;
			}

			return {
				...previewResult,
				account: unlockResult.value.account,
				password: unlockResult.value.password
			};
		} catch (error) {
			if (error instanceof WebAuthnCredentialUnavailableError) {
				await secureCredentialStore.clearCredential();
				return {
					ok: false,
					errorMessage: '已保存凭据已失效，请重新录入账号和密码'
				};
			}
			const message = error instanceof Error ? error.message : '已取消设备验证';
			return {
				ok: false,
				errorMessage: message === 'WebAuthn verification was cancelled' ? '已取消设备验证' : message
			};
		}
	}

	async function clearSavedCredential(): Promise<ClearCredentialOutcome> {
		const result = await secureCredentialStore.clearCredential();
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
					...preview.importMetadata,
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
			const env = getEngine().env;
			if (importMode === ImportMode.OVERWRITE_CURRENT) {
				const activeId = await env.storage.getActiveTimetableId();
				if (activeId) {
					finalPreview = { ...finalPreview, id: activeId };
				}
			}
			await env.storage.saveTimetable(finalPreview as unknown as import('@chronos/core').Timetable);
			await env.storage.setActiveTimetableId(finalPreview.id);
			return { ok: true };
		} catch (err) {
			const msg = err instanceof Error ? err.message : '保存课表失败';
			return { ok: false, errorMessage: msg };
		}
	}

	async function exportToClipboard(): Promise<ExportOutcome> {
		const engine = getEngine();
		const current = engine.state.currentTimetable;
		if (!current) {
			return { ok: false, errorMessage: '当前没有可导出的课表' };
		}
		const result = await shareLinkCodec.encode(current as unknown as Timetable);
		if (!result.ok) {
			return { ok: false, errorMessage: result.error.message };
		}
		try {
			await clipboard.writeText(result.value);
			return { ok: true, statusMessage: '已复制课表链接' };
		} catch {
			return { ok: false, errorMessage: '无法写入剪贴板，请检查浏览器权限' };
		}
	}

	async function getExportMetadata() {
		const engine = getEngine();
		const current = engine.state.currentTimetable;
		if (!current) {
			return { timetableName: null, longLinkWarning: false };
		}
		const encoded = await shareLinkCodec.encode(current as unknown as Timetable);
		const length = encoded.ok ? encoded.value.length : 0;
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

export type TransferImportCoordinator = ReturnType<typeof createTransferImportCoordinator>;
