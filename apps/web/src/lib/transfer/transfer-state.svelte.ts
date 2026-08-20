import { createCredentialVault } from '$lib/client/credential-vault';
import {
	createSessionPreviewPersistence,
	type TransferImportSource
} from '$lib/client/preview-persistence';
import type { SavedCredentialState } from '$lib/models/auth';
import type { CqutCampusId } from '$lib/models/cqut-campus';
import { getCampusDefaultPeriodTimes, inferCampusIdFromCourses } from '$lib/models/cqut-campus';
import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import { AcademicCalendarService, IVaultService, type ChronosEngine } from '@chronos/core';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import { isAccountOnlyFallbackAvailable } from '$lib/client/webauthn/prf-support';
import { onlineImportEnabled } from '$lib/config/features';
import { getAppController } from '$lib/services/app-engine';
import { estimateShareLinkLength, SHARE_LINK_WARNING_LENGTH } from '@chronos/plugin-codec-share';

export type { TransferImportSource };

export interface TransferPreviewState {
	preview: Timetable | null;
	previewSource: TransferImportSource | null;
	importMode: ImportMode;
	htmlImportTermStartDate: string | null;
	htmlImportCampusId: CqutCampusId | null;
	selectedTabId: string;
	account: string;
	password: string;
	saveCredentials: boolean;
	savedCredentialState: SavedCredentialState;
	errorMessage: string | null;
	statusMessage: string | null;
}

function resolveInitialTabId(): string {
	if (onlineImportEnabled) return 'cqut-online';
	return 'share-link';
}

export function createTransferState(engine?: ChronosEngine) {
	let selectedTabId = $state(resolveInitialTabId());
	let preview = $state<Timetable | null>(null);
	let previewSource = $state<TransferImportSource | null>(null);
	let importMode = $state<ImportMode>(ImportMode.AS_NEW);
	let htmlImportTermStartDate = $state<string | null>(null);
	let htmlImportCampusId = $state<CqutCampusId | null>(null);
	let account = $state('');
	let password = $state('');
	let saveCredentials = $state(false);
	let savedCredentialState = $state<SavedCredentialState>({
		account: null,
		hasSavedCredential: false,
		protectionAvailable: false,
		capabilitiesReady: false,
		savedMode: null
	});
	let errorMessage = $state<string | null>(null);
	let statusMessage = $state<string | null>(null);

	const academicCalendarService = new AcademicCalendarService();
	const timeProvider = new SystemTimeProvider();
	const persistence = createSessionPreviewPersistence();
	const credentialVault = engine
		? createCredentialVault({ vault: engine.services.get(IVaultService) })
		: null;

	$effect(() => {
		if (!credentialVault) return;
		return credentialVault.subscribe((state) => {
			savedCredentialState = state;
			if (state.account && account.trim() === '') {
				account = state.account;
			}
		});
	});

	function clearMessages() {
		errorMessage = null;
		statusMessage = null;
	}

	function setSelectedTabId(tabId: string) {
		selectedTabId = tabId;
		preview = null;
		previewSource = null;
		htmlImportTermStartDate = null;
		htmlImportCampusId = null;
		clearMessages();
	}

	function setAccount(value: string) {
		account = value;
		if (previewSource === 'ONLINE') {
			preview = null;
			previewSource = null;
		}
	}

	function setPassword(value: string) {
		password = value;
		if (previewSource === 'ONLINE') {
			preview = null;
			previewSource = null;
		}
	}

	function setSaveCredentials(value: boolean) {
		saveCredentials = value;
	}

	function setImportMode(mode: ImportMode) {
		importMode = mode;
	}

	function setHtmlImportTermStartDate(date: string) {
		htmlImportTermStartDate = academicCalendarService.normalizeTermStartDate(
			date,
			timeProvider.today()
		);
	}

	function setHtmlImportCampusId(campusId: CqutCampusId) {
		htmlImportCampusId = campusId;
	}

	function clearPreview() {
		preview = null;
		previewSource = null;
		htmlImportTermStartDate = null;
		htmlImportCampusId = null;
		persistence.clear();
		clearMessages();
	}

	function setDirectPreview(t: Timetable, source: TransferImportSource = 'SHARE_LINK') {
		clearMessages();
		preview = t;
		previewSource = source;
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
			previewSource =
				tabId === 'cqut-online' ? 'ONLINE' : tabId === 'edu-html' ? 'HTML' : 'SHARE_LINK';
			if (tabId === 'edu-html' && timetable.academicConfig?.termStartDate) {
				htmlImportTermStartDate = timetable.academicConfig.termStartDate;
				htmlImportCampusId =
					(timetable.importMetadata?.campusId as CqutCampusId) ??
					inferCampusIdFromCourses(timetable.courses);
			} else {
				htmlImportTermStartDate = null;
				htmlImportCampusId = null;
			}
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '获取课表失败';
			return false;
		}
	}

	async function previewFromClipboard() {
		clearMessages();
		try {
			const content = await navigator.clipboard.readText();
			const timetable = await executeSlotImport('share-link', { content: content.trim() });
			preview = timetable;
			previewSource = 'SHARE_LINK';
			htmlImportTermStartDate = null;
			htmlImportCampusId = null;
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '无法读取剪贴板，请检查浏览器权限';
			return false;
		}
	}

	async function previewFromHtmlFile(file: File) {
		clearMessages();
		try {
			const fileContent = await file.text();
			const timetable = await executeSlotImport('edu-html', {
				file: fileContent,
				fileContent,
				campusId: 'huaxi',
				termStartDate: timeProvider.today()
			});
			preview = timetable;
			previewSource = 'HTML';
			htmlImportTermStartDate = null;
			htmlImportCampusId = inferCampusIdFromCourses(timetable.courses);
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '解析 HTML 课表失败';
			return false;
		}
	}

	async function previewOnline() {
		clearMessages();
		const trimmedAccount = account.trim();
		if (!trimmedAccount || !password.trim()) {
			errorMessage = '请输入账号和密码';
			return false;
		}

		try {
			const timetable = await executeSlotImport('cqut-online', {
				username: trimmedAccount,
				password,
				saveCredentials
			});
			preview = timetable;
			previewSource = 'ONLINE';
			htmlImportTermStartDate = null;
			htmlImportCampusId = null;
			return true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : '获取在线课表失败';
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

		account = unlockResult.value.account;
		password = unlockResult.value.password;

		try {
			const timetable = await executeSlotImport('cqut-online', {
				username: unlockResult.value.account,
				password: unlockResult.value.password,
				saveCredentials: false
			});
			preview = timetable;
			previewSource = 'ONLINE';
			htmlImportTermStartDate = null;
			htmlImportCampusId = null;
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
		if (!preview || !previewSource) return false;
		persistence.save({
			preview,
			previewSource,
			importMode,
			htmlImportTermStartDate,
			htmlImportCampusId
		});
		return true;
	}

	function loadPersistedPreview(): boolean {
		const snapshot = persistence.load();
		if (!snapshot) return false;
		preview = snapshot.preview;
		previewSource = snapshot.previewSource;
		importMode = snapshot.importMode;
		htmlImportTermStartDate = snapshot.htmlImportTermStartDate;
		htmlImportCampusId = snapshot.htmlImportCampusId;
		return true;
	}

	function clearPersistedPreview() {
		persistence.clear();
	}

	async function confirmImport() {
		clearMessages();
		if (!preview || !previewSource) {
			errorMessage = '请先获取课表';
			return false;
		}

		let finalPreview = preview;
		if (previewSource === 'HTML') {
			if (!htmlImportTermStartDate) {
				errorMessage = '请选择学期起始日期';
				return false;
			}
			if (!htmlImportCampusId) {
				errorMessage = '请选择校区';
				return false;
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
				}
			};
		}

		try {
			if (!engine) {
				throw new Error('ChronosEngine is required for ingest');
			}
			await engine.actions.importTimetable(finalPreview, {
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
		const length = await estimateShareLinkLength(current);
		return {
			timetableName: current.name,
			longLinkWarning: length > SHARE_LINK_WARNING_LENGTH
		};
	}

	return {
		get state(): TransferPreviewState {
			return {
				preview,
				previewSource,
				importMode,
				htmlImportTermStartDate,
				htmlImportCampusId,
				selectedTabId,
				account,
				password,
				saveCredentials,
				savedCredentialState,
				errorMessage,
				statusMessage
			};
		},
		setSelectedTabId,
		setAccount,
		setPassword,
		setSaveCredentials,
		setImportMode,
		setHtmlImportTermStartDate,
		setHtmlImportCampusId,
		clearPreview,
		setDirectPreview,
		previewFromClipboard,
		previewFromHtmlFile,
		previewOnline,
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

export function previewSourceLabel(source: TransferImportSource | null): string {
	switch (source) {
		case 'ONLINE':
			return '知行理工';
		case 'SHARE_LINK':
			return '分享链接';
		case 'HTML':
			return 'HTML 文件';
		default:
			return '未知来源';
	}
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
