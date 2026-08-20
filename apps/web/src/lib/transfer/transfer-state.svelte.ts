import type { CredentialServices } from '$lib/client/credential-services';
import { createCredentialServices } from '$lib/client/credential-services';
import { createTransferImportCoordinator } from '$lib/client/transfer-import-coordinator';
import type { TransferImportSource } from '$lib/client/preview-persistence';
import type { SavedCredentialState } from '$lib/models/auth';
import type { CqutCampusId } from '$lib/models/cqut-campus';
import { inferCampusIdFromCourses } from '$lib/models/cqut-campus';
import type { Timetable } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import { AcademicCalendarService } from '@chronos/core';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import { isAccountOnlyFallbackAvailable } from '$lib/client/webauthn/prf-support';
import { onlineImportEnabled } from '$lib/config/features';

export type { TransferImportSource };

export interface TransferPreviewState {
	preview: Timetable | null;
	previewSource: TransferImportSource | null;
	importMode: ImportMode;
	htmlImportTermStartDate: string | null;
	htmlImportCampusId: CqutCampusId | null;
	selectedSource: TransferImportSource;
	account: string;
	password: string;
	saveCredentials: boolean;
	savedCredentialState: SavedCredentialState;
	errorMessage: string | null;
	statusMessage: string | null;
}

export function createTransferState(
	credentialServices: CredentialServices = createCredentialServices()
) {
	let selectedSource = $state<TransferImportSource>(onlineImportEnabled ? 'ONLINE' : 'SHARE_LINK');
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

	const coordinator = createTransferImportCoordinator({
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
		coordinator.clearPersistedPreview();
		clearMessages();
	}

	function setDirectPreview(t: Timetable, source: TransferImportSource = 'SHARE_LINK') {
		clearMessages();
		preview = t;
		previewSource = source;
		htmlImportTermStartDate = null;
		htmlImportCampusId = null;
		return true;
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
		htmlImportCampusId = null;
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
		htmlImportCampusId = inferCampusIdFromCourses(result.preview.courses);
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
		htmlImportCampusId = null;
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
		htmlImportCampusId = null;
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
			htmlImportTermStartDate,
			htmlImportCampusId
		});
	}

	function loadPersistedPreview(): boolean {
		const snapshot = coordinator.loadPersistedPreview();
		if (!snapshot) return false;
		preview = snapshot.preview;
		previewSource = snapshot.previewSource;
		importMode = snapshot.importMode;
		htmlImportTermStartDate = snapshot.htmlImportTermStartDate;
		htmlImportCampusId =
			snapshot.htmlImportCampusId ??
			(snapshot.previewSource === 'HTML'
				? inferCampusIdFromCourses(snapshot.preview.courses)
				: null);
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
			htmlImportTermStartDate,
			htmlImportCampusId
		);

		if (!result.ok) {
			errorMessage = result.errorMessage;
			return false;
		}

		clearPreview();
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

	async function getExportMetadata() {
		return await coordinator.getExportMetadata();
	}

	return {
		get state(): TransferPreviewState {
			return {
				preview,
				previewSource,
				importMode,
				htmlImportTermStartDate,
				htmlImportCampusId,
				selectedSource,
				account,
				password,
				saveCredentials,
				savedCredentialState,
				errorMessage,
				statusMessage
			};
		},
		setSelectedSource,
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
		persistPreview,
		loadPersistedPreview,
		clearPersistedPreview,
		confirmImport,
		exportToClipboard,
		getExportMetadata
	};
}

export type TransferStateController = ReturnType<typeof createTransferState>;

export function shouldShowCampusSelection(source: TransferImportSource | null): boolean {
	return source === 'HTML';
}

export function shouldShowTermStartDateSelection(source: TransferImportSource | null): boolean {
	return source === 'HTML';
}

export function canSaveCredentials(savedCredentialState: SavedCredentialState): boolean {
	return (
		savedCredentialState.capabilitiesReady &&
		(savedCredentialState.protectionAvailable || isAccountOnlyFallbackAvailable())
	);
}

export function saveCredentialsLabel(savedCredentialState: SavedCredentialState): string {
	if (!savedCredentialState.capabilitiesReady) {
		return '正在检测设备能力…';
	}
	return savedCredentialState.protectionAvailable ? '安全保存凭据' : '仅保存账号';
}

export function previewSourceLabel(source: TransferImportSource | null): string {
	switch (source) {
		case 'ONLINE':
			return '知行理工';
		case 'HTML':
			return 'HTML 文件';
		case 'SHARE_LINK':
			return '分享链接';
		default:
			return '未知来源';
	}
}
