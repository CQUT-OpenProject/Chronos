import { createGenericCredentialVault } from '$lib/client/credential-vault';
import { createSessionPreviewPersistence } from '$lib/client/preview-persistence';
import type { SavedCredentialState } from '$lib/models/auth';
import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import { IVaultService, IStorageService, type ChronosEngine } from '@chronos/core';
import type { ImportTabSlotContribution } from '@chronos/core';
import { isAccountOnlyFallbackAvailable } from '$lib/client/webauthn/prf-support';
import { getDefaultImportSlot } from '$lib/config/features';
import { getAppController } from '$lib/services/app-engine';

const SHARE_LINK_MAX_RECOMMENDED_LENGTH = 2000;

export interface TransferPreviewState {
	preview: Timetable | null;
	selectedSlotId: string;
	previewSlotId: string | null;
	importMode: ImportMode;
	savedCredentialState: SavedCredentialState;
	errorMessage: string | null;
	statusMessage: string | null;
}

export interface CqutOnlineImportInputs {
	username: string;
	password: string;
	saveCredentials: boolean;
}

function resolveInitialSlotId(): string {
	return getDefaultImportSlot();
}

export function createTransferState(engine?: ChronosEngine) {
	let selectedSlotId = $state(resolveInitialSlotId());
	let preview = $state<Timetable | null>(null);
	let previewSlotId = $state<string | null>(null);
	let importMode = $state<ImportMode>(ImportMode.AS_NEW);
	let savedCredentialState = $state<SavedCredentialState>({
		account: null,
		hasSavedCredential: false,
		protectionAvailable: false,
		capabilitiesReady: false,
		savedMode: null
	});
	let errorMessage = $state<string | null>(null);
	let statusMessage = $state<string | null>(null);

	const persistence = createSessionPreviewPersistence();
	const storageService = (() => {
		try {
			return engine?.services.get(IStorageService) as IStorageService | null;
		} catch {
			return null;
		}
	})();
	const vaultService = (() => {
		try {
			const svc = (engine?.services as unknown as { tryGet?: (id: unknown) => unknown })?.tryGet?.(
				IVaultService
			);
			if (svc) return svc as never;
			return engine?.services.get(IVaultService) as never;
		} catch {
			return undefined;
		}
	})() as IVaultService | undefined;

	function resolveCredentialMeta(): {
		pluginId: string;
		recordKey: string;
		vaultKey: string;
	} | null {
		// 优先从已注册的 import.source.tab 缝隙中解析 credential 元数据
		const tryFromEngine = (): { pluginId: string; recordKey: string; vaultKey: string } | null => {
			if (!engine) return null;
			try {
				const tabs = engine.slots.get('import.source.tab') as ImportTabSlotContribution[];
				for (const tab of tabs) {
					const cred = (tab as ImportTabSlotContribution).credential as
						| { recordKey: string; vaultKey: string }
						| undefined;
					if (cred?.recordKey && cred?.vaultKey) {
						const owner = engine.slots.resolveOwner('import.source.tab', tab.id);
						if (owner)
							return { pluginId: owner, recordKey: cred.recordKey, vaultKey: cred.vaultKey };
					}
				}
			} catch {}
			return null;
		};
		const tryFromController = (): {
			pluginId: string;
			recordKey: string;
			vaultKey: string;
		} | null => {
			try {
				const controller = getAppController();
				const tabs = controller.getSlots('import.source.tab') as ImportTabSlotContribution[];
				for (const tab of tabs) {
					const cred = (tab as ImportTabSlotContribution).credential as
						| { recordKey: string; vaultKey: string }
						| undefined;
					if (cred?.recordKey && cred?.vaultKey) {
						const owner = engine?.slots.resolveOwner('import.source.tab', tab.id) ?? 'source-cqut';
						return { pluginId: owner, recordKey: cred.recordKey, vaultKey: cred.vaultKey };
					}
				}
			} catch {}
			return null;
		};
		return tryFromEngine() ?? tryFromController();
	}

	function createVaultFromMeta(
		meta: { pluginId: string; recordKey: string; vaultKey: string } | null
	) {
		if (!meta || !storageService || !vaultService) return null;
		return createGenericCredentialVault({
			vault: vaultService,
			storage: storageService,
			pluginId: meta.pluginId,
			recordKey: meta.recordKey,
			vaultKey: meta.vaultKey
		});
	}

	let credentialMeta = $state(resolveCredentialMeta());
	let credentialVault = $state(createVaultFromMeta(credentialMeta));

	$effect(() => {
		// 监听缝隙版本，插件加载/卸载后重新解析 credential 元数据
		try {
			void getAppController().slotVersion;
		} catch {}
		const nextMeta = resolveCredentialMeta();
		if (
			nextMeta?.pluginId !== credentialMeta?.pluginId ||
			nextMeta?.recordKey !== credentialMeta?.recordKey ||
			nextMeta?.vaultKey !== credentialMeta?.vaultKey
		) {
			credentialMeta = nextMeta;
			credentialVault = createVaultFromMeta(nextMeta);
		}
	});

	$effect(() => {
		if (!credentialVault) {
			// 无凭据源时重置为初始态
			savedCredentialState = {
				account: null,
				hasSavedCredential: false,
				protectionAvailable: false,
				capabilitiesReady: false,
				savedMode: null
			};
			return;
		}
		return credentialVault.subscribe((state) => {
			savedCredentialState = state;
		});
	});

	function clearMessages() {
		errorMessage = null;
		statusMessage = null;
	}

	function setSelectedSlotId(slotId: string) {
		selectedSlotId = slotId;
		preview = null;
		previewSlotId = null;
		clearMessages();
	}

	function setImportMode(mode: ImportMode) {
		importMode = mode;
	}

	function clearPreview() {
		preview = null;
		previewSlotId = null;
		persistence.clear();
		clearMessages();
	}

	function setDirectPreview(t: Timetable, slotId = 'share-link') {
		clearMessages();
		preview = t;
		previewSlotId = slotId;
		return true;
	}

	async function executeSlotImport(
		tabId: string,
		inputs: Record<string, unknown>
	): Promise<Timetable> {
		const controller = getAppController();
		const tab = controller.getSlots('import.source.tab').find((item) => item.id === tabId);
		if (!tab) {
			throw new Error('导入源不可用');
		}
		const ctx = controller.getPluginContextForSlot('import.source.tab', tabId);
		const timetable = await tab.executeImport(inputs, ctx);
		if (!timetable?.courses?.length) {
			throw new Error('未识别到任何有效课程数据');
		}
		return timetable;
	}

	async function previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean> {
		clearMessages();
		try {
			const timetable = await executeSlotImport(tabId, inputs);
			preview = timetable;
			previewSlotId = tabId;
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '获取课表失败';
			return false;
		}
	}

	/** @deprecated 优先使用 previewWithSlot('share-link', { content })，此方法仅为兼容保留 */
	async function previewFromClipboard() {
		try {
			const content = await navigator.clipboard.readText();
			return await previewWithSlot('share-link', { content: content.trim() });
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '无法读取剪贴板，请检查浏览器权限';
			return false;
		}
	}

	/** @deprecated 优先使用 previewWithSlot('cqut-online', inputs) */
	async function previewOnline(inputs: CqutOnlineImportInputs) {
		const trimmedAccount = inputs.username.trim();
		if (!trimmedAccount || !inputs.password.trim()) {
			errorMessage = '请输入账号和密码';
			return false;
		}
		return previewWithSlot('cqut-online', {
			username: trimmedAccount,
			account: trimmedAccount,
			password: inputs.password,
			saveCredentials: inputs.saveCredentials
		});
	}

	/** @deprecated 优先使用 previewWithSlot('edu-html', { file }) */
	async function previewFromHtmlFile(file: File) {
		try {
			const fileContent = await file.text();
			return await previewWithSlot('edu-html', {
				file: fileContent,
				fileContent
			});
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '解析 HTML 课表失败';
			return false;
		}
	}

	async function previewWithSavedCredential() {
		clearMessages();
		if (!credentialVault || !savedCredentialState.hasSavedCredential) {
			errorMessage = '当前没有可用的已保存凭据';
			return false;
		}

		const unlockResult = await credentialVault.unlock();
		if (!unlockResult.ok) {
			errorMessage = unlockResult.error.message;
			return false;
		}

		try {
			const timetable = await executeSlotImport('cqut-online', {
				username: unlockResult.value.account,
				account: unlockResult.value.account,
				password: unlockResult.value.password,
				saveCredentials: false
			});
			preview = timetable;
			previewSlotId = 'cqut-online';
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '获取在线课表失败';
			return false;
		}
	}

	async function clearSavedCredential() {
		clearMessages();
		if (!credentialVault) {
			errorMessage = '当前环境不支持凭据管理';
			return false;
		}
		const result = await credentialVault.clear();
		if (!result.ok) {
			errorMessage = result.error.message;
			return false;
		}
		statusMessage = '已清除已保存凭据';
		return true;
	}

	function persistPreview() {
		if (!preview || !previewSlotId) return false;
		persistence.save({
			preview,
			slotId: previewSlotId,
			importMode
		});
		return true;
	}

	function loadPersistedPreview(): boolean {
		const snapshot = persistence.load();
		if (!snapshot) return false;
		preview = snapshot.preview;
		previewSlotId = snapshot.slotId;
		importMode = snapshot.importMode;
		return true;
	}

	function clearPersistedPreview() {
		persistence.clear();
	}

	async function confirmImport() {
		clearMessages();
		if (!preview) {
			errorMessage = '请先获取课表';
			return false;
		}

		try {
			if (!engine) {
				throw new Error('ChronosEngine is required for ingest');
			}
			await engine.actions.importTimetable(preview, {
				overwriteActive: importMode === ImportMode.OVERWRITE_CURRENT
			});
			clearPreview();
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '保存课表失败';
			return false;
		}
	}

	async function getExportMetadata() {
		if (!engine) {
			return { timetableName: null, longLinkWarning: false };
		}
		const current = engine.state.currentTimetable;
		if (!current) {
			return { timetableName: null, longLinkWarning: false };
		}
		const controller = getAppController();
		const exportSlot = controller.getSlotItem('export.action', 'share-link');
		const length = exportSlot?.estimateLength ? await exportSlot.estimateLength(current) : 0;
		return {
			timetableName: current.name,
			longLinkWarning: length > SHARE_LINK_MAX_RECOMMENDED_LENGTH
		};
	}

	return {
		get state(): TransferPreviewState {
			return {
				preview,
				selectedSlotId,
				previewSlotId,
				importMode,
				savedCredentialState,
				errorMessage,
				statusMessage
			};
		},
		setSelectedSlotId,
		setImportMode,
		clearPreview,
		setDirectPreview,
		previewFromClipboard,
		previewOnline,
		previewFromHtmlFile,
		previewWithSavedCredential,
		clearSavedCredential,
		previewWithSlot,
		executeSlotImport,
		persistPreview,
		loadPersistedPreview,
		clearPersistedPreview,
		confirmImport,
		getExportMetadata
	};
}

export type TransferStateController = ReturnType<typeof createTransferState>;

export function resolveSlotTitle(slotId: string | null): string {
	if (!slotId) return '未知来源';
	try {
		const controller = getAppController();
		const slot = controller.getSlotItem('import.source.tab', slotId);
		if (slot) {
			return typeof slot.title === 'function' ? slot.title() : slot.title;
		}
	} catch {
		// Engine not ready
	}
	return slotId;
}

export function canSaveCredentials(state: SavedCredentialState): boolean {
	if (!state.capabilitiesReady) return false;
	return state.protectionAvailable || isAccountOnlyFallbackAvailable();
}

export function saveCredentialsLabel(state: SavedCredentialState): string {
	if (!state.capabilitiesReady) {
		return '正在检测设备能力…';
	}
	if (state.protectionAvailable) {
		return '保存帐号密码';
	}
	if (isAccountOnlyFallbackAvailable()) {
		return '保存账号（密码需每次输入）';
	}
	return '当前设备不支持保存帐号密码';
}
