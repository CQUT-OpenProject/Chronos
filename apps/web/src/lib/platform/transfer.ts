import type { ExportResult } from '@chronos/core';

export function downloadExportResult(
	result: ExportResult,
	fallbackFilename = 'timetable-export'
): void {
	const part: BlobPart =
		typeof result.content === 'string' ? result.content : new Uint8Array(result.content);
	const blob = new Blob([part], { type: result.mimeType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = result.filename ?? fallbackFilename;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	URL.revokeObjectURL(url);
}

export async function copyTextWithFallback(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		try {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(textarea);
			return ok;
		} catch {
			return false;
		}
	}
}

export function withTimeout<T>(
	promise: Promise<T>,
	ms = 15000,
	timeoutMessage = 'timeout'
): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}
