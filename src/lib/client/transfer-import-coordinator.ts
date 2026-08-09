import type { TransferServices } from '$lib/client/transfer-services';
import type { SecureCredentialStore } from '$lib/domain/interfaces/secure-credential-store';
import { ImportMode } from '$lib/domain/import-mode';
import type { SavedCredentialState } from '$lib/models/auth';
import type { Timetable } from '$lib/models/timetable';
import { createPrfCredential, getPrfOutput } from '$lib/client/webauthn/prf-coordinator';
import { base64ToBytes } from '$lib/client/webauthn/binary';
import { isAccountOnlyFallbackAvailable } from '$lib/client/webauthn/prf-support';
import {
	createSessionPreviewPersistence,
	type PreviewPersistence,
	type PreviewSnapshot,
	type TransferImportSource
} from './preview-persistence';

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
	services: TransferServices;
	secureCredentialStore: SecureCredentialStore;
	previewPersistence?: PreviewPersistence;
	clipboard?: ClipboardGateway;
}

export function createTransferImportCoordinator({
	services,
	secureCredentialStore,
	previewPersistence = createSessionPreviewPersistence(),
	clipboard = createNavigatorClipboardGateway()
}: TransferImportCoordinatorDeps) {
	async function previewFromText(content: string): Promise<PreviewOutcome> {
		const result = services.previewImported.invoke(content.trim());
		if (!result.ok) {
			return { ok: false, errorMessage: result.error.message };
		}
		return { ok: true, preview: result.value, source: 'SHARE_LINK' };
	}

	async function previewFromClipboard(): Promise<PreviewOutcome> {
		try {
			const content = await clipboard.readText();
			return previewFromText(content);
		} catch {
			return { ok: false, errorMessage: '无法读取剪贴板，请检查浏览器权限' };
		}
	}

	async function previewFromHtmlFile(file: File): Promise<PreviewOutcome> {
		const bytes = new Uint8Array(await file.arrayBuffer());
		const result = services.previewImported.previewHtml(bytes);
		if (!result.ok) {
			return { ok: false, errorMessage: result.error.message };
		}
		return { ok: true, preview: result.value, source: 'HTML' };
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

		if (!isAccountOnlyFallbackAvailable()) {
			return '当前设备不支持保存帐号密码';
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

		const result = await services.previewOnline.invoke({
			account: trimmedAccount,
			password
		});
		if (!result.ok) {
			return { ok: false, errorMessage: result.error.message };
		}

		const statusMessage = await saveCredentialsIfNeeded(
			trimmedAccount,
			password,
			saveCredentials,
			savedCredentialState
		);

		return {
			ok: true,
			preview: result.value,
			source: 'ONLINE',
			statusMessage: statusMessage ?? undefined
		};
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

			const previewResult = await services.previewOnline.invoke(unlockResult.value);
			if (!previewResult.ok) {
				return { ok: false, errorMessage: previewResult.error.message };
			}

			return {
				ok: true,
				preview: previewResult.value,
				source: 'ONLINE',
				account: unlockResult.value.account,
				password: unlockResult.value.password
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : '设备验证失败';
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
		return { ok: true, statusMessage: '已清除已保存凭据' };
	}

	function persistPreview(snapshot: PreviewSnapshot): boolean {
		if (!snapshot.preview || !snapshot.previewSource) return false;
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
		htmlImportTermStartDate: string | null
	): Promise<ImportOutcome> {
		let finalPreview = preview;
		if (previewSource === 'HTML') {
			if (!htmlImportTermStartDate) {
				return { ok: false, errorMessage: '请选择学期起始日期' };
			}
			finalPreview = {
				...preview,
				academicConfig: {
					...preview.academicConfig,
					termStartDate: htmlImportTermStartDate
				}
			};
		}

		const result = await services.importTimetable.import(finalPreview, importMode);
		if (!result.ok) {
			return { ok: false, errorMessage: result.error.message };
		}
		return { ok: true };
	}

	async function exportToClipboard(): Promise<ExportOutcome> {
		const result = await services.exportCurrent.invoke();
		if (!result.ok) {
			return { ok: false, errorMessage: result.error.message };
		}
		if (!result.value) {
			return { ok: false, errorMessage: '当前没有可导出的课表' };
		}
		try {
			await clipboard.writeText(result.value);
			return { ok: true, statusMessage: '已复制课表链接' };
		} catch {
			return { ok: false, errorMessage: '无法写入剪贴板，请检查浏览器权限' };
		}
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
		exportToClipboard
	};
}

export type TransferImportCoordinator = ReturnType<typeof createTransferImportCoordinator>;
