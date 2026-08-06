import type { TransferServices } from '$lib/client/transfer-services';
import type { CredentialServices } from '$lib/client/credential-services';
import { createTransferServices } from '$lib/client/transfer-services';
import { createCredentialServices } from '$lib/client/credential-services';
import type { SavedCredentialState } from '$lib/models/auth';
import type { Timetable } from '$lib/models/timetable';
import { TimetableImportSource } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import { createPrfCredential, getPrfOutput } from '$lib/client/webauthn/prf-coordinator';
import { base64ToBytes } from '$lib/client/webauthn/binary';
import { isAccountOnlyFallbackAvailable } from '$lib/client/webauthn/prf-support';

export type TransferImportSource = 'ONLINE' | 'JSON' | 'HTML';

const PREVIEW_KEY = 'chronos:import-preview';
const PREVIEW_SOURCE_KEY = 'chronos:import-preview-source';

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

interface UnlockPreparePayload {
	salt: string;
	credentialId: string;
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

	$effect(() => {
		return credentialServices.observeSavedCredential.subscribe((state) => {
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
		clearMessages();
	}

	async function previewFromClipboard() {
		clearMessages();
		try {
			const content = await navigator.clipboard.readText();
			const result = services.previewImported.invoke(content.trim());
			if (!result.ok) {
				errorMessage = result.error.message;
				return false;
			}
			preview = result.value;
			previewSource = 'JSON';
			htmlImportTermStartDate = null;
			return true;
		} catch {
			errorMessage = '无法读取剪贴板，请检查浏览器权限';
			return false;
		}
	}

	async function previewFromHtmlFile(file: File) {
		clearMessages();
		const bytes = new Uint8Array(await file.arrayBuffer());
		const result = services.previewImported.previewHtml(bytes);
		if (!result.ok) {
			errorMessage = result.error.message;
			return false;
		}
		preview = result.value;
		previewSource = 'HTML';
		htmlImportTermStartDate = null;
		return true;
	}

	async function saveCredentialsIfNeeded(trimmedAccount: string, currentPassword: string) {
		if (!saveCredentials) return;

		if (savedCredentialState.protectionAvailable) {
			const prepareResult = await credentialServices.prepareSave.invoke();
			if (!prepareResult.ok) {
				statusMessage = prepareResult.error.message;
				return;
			}

			try {
				const created = await createPrfCredential(base64ToBytes(prepareResult.value));
				const saveResult = await credentialServices.saveCredential.invoke(
					trimmedAccount,
					currentPassword,
					JSON.stringify({
						prf: created.prfOutput,
						credentialId: created.credentialId
					})
				);
				if (!saveResult.ok) {
					statusMessage = saveResult.error.message;
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : '已取消设备验证';
				statusMessage =
					message === 'WebAuthn verification was cancelled' ||
					message === 'WebAuthn registration was cancelled'
						? '已获取预览，未保存凭据'
						: message;
			}
			return;
		}

		if (!isAccountOnlyFallbackAvailable()) {
			statusMessage = '当前设备不支持保存帐号密码';
			return;
		}

		const saveResult = await credentialServices.saveCredential.invoke(trimmedAccount, '', '');
		if (!saveResult.ok) {
			statusMessage = saveResult.error.message;
		}
	}

	async function previewOnline() {
		clearMessages();
		const trimmedAccount = account.trim();
		if (!trimmedAccount || !password.trim()) {
			errorMessage = '请输入账号和密码';
			return false;
		}

		const result = await services.previewOnline.invoke({
			account: trimmedAccount,
			password
		});
		if (!result.ok) {
			errorMessage = result.error.message;
			return false;
		}

		preview = result.value;
		previewSource = 'ONLINE';
		htmlImportTermStartDate = null;
		await saveCredentialsIfNeeded(trimmedAccount, password);
		return true;
	}

	async function previewWithSavedCredential() {
		clearMessages();
		if (!savedCredentialState.hasSavedCredential) {
			errorMessage = '当前没有可用的已保存凭据';
			return false;
		}

		const prepareResult = await credentialServices.prepareUnlock.invoke();
		if (!prepareResult.ok) {
			errorMessage = prepareResult.error.message;
			return false;
		}

		try {
			const payload = JSON.parse(prepareResult.value) as UnlockPreparePayload;
			const prfOutput = await getPrfOutput(payload.salt, payload.credentialId);
			const unlockResult = await credentialServices.unlockCredential.invoke(
				JSON.stringify({ prf: prfOutput })
			);
			if (!unlockResult.ok) {
				errorMessage = unlockResult.error.message;
				return false;
			}

			const previewResult = await services.previewOnline.invoke(unlockResult.value);
			if (!previewResult.ok) {
				errorMessage = previewResult.error.message;
				return false;
			}

			preview = previewResult.value;
			previewSource = 'ONLINE';
			htmlImportTermStartDate = null;
			account = unlockResult.value.account;
			password = unlockResult.value.password;
			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : '设备验证失败';
			errorMessage = message === 'WebAuthn verification was cancelled' ? '已取消设备验证' : message;
			return false;
		}
	}

	async function clearSavedCredential() {
		clearMessages();
		const result = await credentialServices.clearCredential.invoke();
		if (!result.ok) {
			errorMessage = result.error.message;
			return false;
		}
		saveCredentials = false;
		if (previewSource === 'ONLINE') {
			clearPreview();
		}
		statusMessage = '已清除已保存凭据';
		return true;
	}

	function persistPreview() {
		if (!preview || !previewSource) return false;
		sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(preview));
		sessionStorage.setItem(PREVIEW_SOURCE_KEY, previewSource);
		sessionStorage.setItem('chronos:import-mode', importMode);
		if (htmlImportTermStartDate) {
			sessionStorage.setItem('chronos:html-term-start', htmlImportTermStartDate);
		} else {
			sessionStorage.removeItem('chronos:html-term-start');
		}
		return true;
	}

	function loadPersistedPreview(): boolean {
		const raw = sessionStorage.getItem(PREVIEW_KEY);
		const source = sessionStorage.getItem(PREVIEW_SOURCE_KEY) as TransferImportSource | null;
		if (!raw || !source) return false;
		try {
			preview = JSON.parse(raw) as Timetable;
			previewSource = source;
			importMode =
				(sessionStorage.getItem('chronos:import-mode') as ImportMode | null) ?? ImportMode.AS_NEW;
			htmlImportTermStartDate = sessionStorage.getItem('chronos:html-term-start');
			return true;
		} catch {
			return false;
		}
	}

	function clearPersistedPreview() {
		sessionStorage.removeItem(PREVIEW_KEY);
		sessionStorage.removeItem(PREVIEW_SOURCE_KEY);
		sessionStorage.removeItem('chronos:import-mode');
		sessionStorage.removeItem('chronos:html-term-start');
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
			errorMessage = result.error.message;
			return false;
		}

		clearPersistedPreview();
		clearPreview();
		statusMessage = '导入成功';
		return true;
	}

	async function exportToClipboard() {
		clearMessages();
		const result = await services.exportCurrent.invoke();
		if (!result.ok) {
			errorMessage = result.error.message;
			return false;
		}
		if (!result.value) {
			errorMessage = '当前没有可导出的课表';
			return false;
		}
		try {
			await navigator.clipboard.writeText(result.value);
			statusMessage = '已复制到剪贴板';
			return true;
		} catch {
			errorMessage = '无法写入剪贴板，请检查浏览器权限';
			return false;
		}
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

export function isHtmlImportSource(preview: Timetable | null): boolean {
	return preview?.importMetadata.source === TimetableImportSource.FILE_HTML;
}

export function previewSourceLabel(source: TransferImportSource | null): string {
	switch (source) {
		case 'ONLINE':
			return '教务处';
		case 'JSON':
			return '分享 JSON';
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
