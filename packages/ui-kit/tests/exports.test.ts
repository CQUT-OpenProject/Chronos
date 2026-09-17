import { describe, it, expect } from 'vite-plus/test';
import { PREVIEW_PAINT_READY_CONTEXT, TIMETABLE_PRESENTATION_CONTEXT } from '../src/index';

describe('ui-kit context keys', () => {
	it('keeps preview and presentation context ids stable', () => {
		expect(PREVIEW_PAINT_READY_CONTEXT).toBe('chronos.previewPaintReady');
		expect(TIMETABLE_PRESENTATION_CONTEXT).toBe('chronos.timetablePresentation');
	});
});
