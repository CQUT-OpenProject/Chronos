import type { TransferServices } from '$lib/client/transfer-services';
import type { CredentialServices } from '$lib/client/credential-services';
import { createTransferServices } from '$lib/client/transfer-services';
import { createCredentialServices } from '$lib/client/credential-services';
import { createTransferImportCoordinator } from '$lib/client/transfer-import-coordinator';
import type { TransferImportSource } from '$lib/client/preview-persistence';
import type { SavedCredentialState } from '$lib/models/auth';
import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import { isAccountOnlyFallbackAvailable } from '$lib/client/webauthn/prf-support';

export type { TransferImportSource };

export interface TransferPreviewState {
	preview: Timetable | null;
	previewSource: TransferImportSource | null;
	importMode: ImportMode;
	htmlImportTermStartDate: string | null;
	selectedSource: TransferImportSource;
	account: string;
	password: string;
	saveCredentials: boolean;
	savedCredentialState: SavedCredentialState;
	errorMessage: string | null;
	statusMessage: string | null;
}

export function createTransferState(
	services: TransferServices = createTransferServices(),
	credentialServices: CredentialServices = createCredentialServices()
) {
	let selectedSource = $state<TransferImportSource>('ONLINE');
	let preview = $state<Timetable | null>(null);
	let previewSource = $state<TransferImportSource | null>(null);
	let importMode = $state<ImportMode>(ImportMode.AS_NEW);
	let htmlImportTermStartDate = $state<string | null>(null);
	let account = $state('');
	let password = $state('');
	let saveCredentials = $state(false);
	let savedCredentialState = $state<SavedCredentialState>({
		account: null,
		hasSavedCredential: false,
		protectionAvailable: false
	});
	let errorMessage = $state<string | null>(null);
	let statusMessage = $state<string | null>(null);

	const academicCalendarService = new AcademicCalendarService();
	const timeProvider = new SystemTimeProvider();

	const coordinator = createTransferImportCoordinator({
		services,
		secureCredentialStore: credentialServices.secureCredentialStore
	});

	$effect(() => {
		return credentialServices.secureCredentialStore.subscribeSavedCredentialState((state) => {
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

	function setSelectedSource(source: TransferImportSource) {
		selectedSource = source;
		preview = null;
		previewSource = null;
		htmlImportTermStartDate = null;
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

	function clearPreview() {
		preview = null;
		previewSource = null;
		htmlImportTermStartDate = null;
		coordinator.clearPersistedPreview();
		clearMessages();
	}

	async function previewFromClipboard() {
		clearMessages();
		const result = await coordinator.previewFromClipboard();
		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}
		preview = result.preview;
		previewSource = result.source;
		htmlImportTermStartDate = null;
		return true;
	}

	async function previewFromHtmlFile(file: File) {
		clearMessages();
		const result = await coordinator.previewFromHtmlFile(file);
		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}
		preview = result.preview;
		previewSource = result.source;
		htmlImportTermStartDate = null;
		return true;
	}

	async function previewOnline() {
		clearMessages();
		const result = await coordinator.previewOnline(
			account,
			password,
			saveCredentials,
			savedCredentialState
		);
		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}
		preview = result.preview;
		previewSource = result.source;
		htmlImportTermStartDate = null;
		if (result.statusMessage) {
			statusMessage = result.statusMessage;
		}
		return true;
	}

	async function previewWithSavedCredential() {
		clearMessages();
		const result = await coordinator.previewWithSavedCredential(savedCredentialState);
		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}
		preview = result.preview;
		previewSource = result.source;
		htmlImportTermStartDate = null;
		if (result.account) account = result.account;
		if (result.password) password = result.password;
		return true;
	}

	async function clearSavedCredential() {
		clearMessages();
		const result = await coordinator.clearSavedCredential();
		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}
		saveCredentials = false;
		if (previewSource === 'ONLINE') {
			clearPreview();
		}
		statusMessage = result.statusMessage;
		return true;
	}

	function persistPreview() {
		if (!preview || !previewSource) return false;
		return coordinator.persistPreview({
			preview,
			previewSource,
			importMode,
			htmlImportTermStartDate
		});
	}

	function loadPersistedPreview(): boolean {
		const snapshot = coordinator.loadPersistedPreview();
		if (!snapshot) return false;
		preview = snapshot.preview;
		previewSource = snapshot.previewSource;
		importMode = snapshot.importMode;
		htmlImportTermStartDate = snapshot.htmlImportTermStartDate;
		return true;
	}

	function clearPersistedPreview() {
		coordinator.clearPersistedPreview();
	}

	async function confirmImport() {
		clearMessages();
		if (!preview || !previewSource) {
			errorMessage = '请先获取课表';
			return false;
		}

		const result = await coordinator.confirmImport(
			preview,
			previewSource,
			importMode,
			htmlImportTermStartDate
		);
		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}

		clearPersistedPreview();
		clearPreview();
		statusMessage = '导入成功';
		return true;
	}

	async function exportToClipboard() {
		clearMessages();
		const result = await coordinator.exportToClipboard();
		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}
		statusMessage = result.statusMessage;
		return true;
	}

	const state = $derived({
		selectedSource,
		preview,
		previewSource,
		importMode,
		htmlImportTermStartDate,
		account,
		password,
		saveCredentials,
		savedCredentialState,
		errorMessage,
		statusMessage
	} satisfies TransferPreviewState);

	return {
		get state() {
			return state;
		},
		setSelectedSource,
		setAccount,
		setPassword,
		setSaveCredentials,
		setImportMode,
		setHtmlImportTermStartDate,
		clearPreview,
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
	return state.protectionAvailable || isAccountOnlyFallbackAvailable();
}

export function saveCredentialsLabel(state: SavedCredentialState): string {
	if (state.protectionAvailable) {
		return '保存帐号密码';
	}
	if (isAccountOnlyFallbackAvailable()) {
		return '保存账号（密码需每次输入）';
	}
	return '当前设备不支持保存帐号密码';
}
