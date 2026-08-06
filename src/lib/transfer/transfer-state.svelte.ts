import type { Timetable } from '$lib/models/timetable';
import { TimetableImportSource } from '$lib/models/timetable';
import { ImportMode } from '$lib/domain/import-mode';
import { createTransferServices, type TransferServices } from '$lib/client/transfer-services';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';

export type TransferImportSource = 'JSON' | 'HTML';

const PREVIEW_KEY = 'chronos:import-preview';
const PREVIEW_SOURCE_KEY = 'chronos:import-preview-source';

export interface TransferPreviewState {
	preview: Timetable | null;
	previewSource: TransferImportSource | null;
	importMode: ImportMode;
	htmlImportTermStartDate: string | null;
	selectedSource: TransferImportSource;
	errorMessage: string | null;
	statusMessage: string | null;
}

export function createTransferState(services: TransferServices = createTransferServices()) {
	let selectedSource = $state<TransferImportSource>('JSON');
	let preview = $state<Timetable | null>(null);
	let previewSource = $state<TransferImportSource | null>(null);
	let importMode = $state<ImportMode>(ImportMode.AS_NEW);
	let htmlImportTermStartDate = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);
	let statusMessage = $state<string | null>(null);

	const academicCalendarService = new AcademicCalendarService();
	const timeProvider = new SystemTimeProvider();

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
		errorMessage,
		statusMessage
	} satisfies TransferPreviewState);

	return {
		get state() {
			return state;
		},
		setSelectedSource,
		setImportMode,
		setHtmlImportTermStartDate,
		clearPreview,
		previewFromClipboard,
		previewFromHtmlFile,
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
