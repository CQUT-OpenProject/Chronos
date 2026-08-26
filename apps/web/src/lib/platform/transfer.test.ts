import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyTextWithFallback, downloadExportResult, withTimeout } from './transfer';

describe('platform/transfer', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('downloadExportResult creates a temporary anchor', () => {
		const click = vi.fn();
		const removeChild = vi.fn();
		const appendChild = vi.fn();
		const createObjectURL = vi.fn(() => 'blob:export');
		const revokeObjectURL = vi.fn();

		vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
		vi.stubGlobal('document', {
			createElement: () => ({ click, download: '', href: '' }),
			body: { appendChild, removeChild }
		});

		downloadExportResult({
			mimeType: 'text/plain',
			content: 'hello',
			filename: 'export.txt'
		});

		expect(createObjectURL).toHaveBeenCalled();
		expect(click).toHaveBeenCalled();
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:export');
	});

	it('copyTextWithFallback uses clipboard when available', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('navigator', { clipboard: { writeText } });

		await expect(copyTextWithFallback('payload')).resolves.toBe(true);
		expect(writeText).toHaveBeenCalledWith('payload');
	});

	it('withTimeout rejects when the promise is too slow', async () => {
		await expect(withTimeout(new Promise<string>(() => {}), 10, 'slow')).rejects.toThrow('slow');
	});
});
