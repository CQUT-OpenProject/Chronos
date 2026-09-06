import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/i18n/host-i18n.svelte', () => ({
	hostT: (key: string, params?: Record<string, unknown>) => {
		if (params) {
			return `${key}:${JSON.stringify(params)}`;
		}
		return key;
	}
}));

import {
	createHostDateFieldLabels,
	createHostTimePickerLabels,
	createHostTimeWheelColumnLabels
} from './host-form-labels';

describe('host-form-labels', () => {
	it('maps date field labels to host message keys', () => {
		const labels = createHostDateFieldLabels();
		expect(labels.placeholder).toBe('ui.date.placeholder');
		expect(labels.today).toBe('ui.date.today');
		expect(labels.triggerEmpty('学期起始日')).toBe('ui.date.trigger.empty:{"label":"学期起始日"}');
		expect(labels.triggerLabeled('学期起始日', '2026/2/23')).toBe(
			'ui.date.trigger.labeled:{"label":"学期起始日","display":"2026/2/23"}'
		);
	});

	it('maps time picker labels to host message keys', () => {
		const labels = createHostTimePickerLabels();
		expect(labels.placeholder).toBe('ui.time.placeholder');
		expect(labels.cancel).toBe('common.cancel');
		expect(labels.columnAria('开始', '时')).toBe('ui.time.column:{"label":"开始","column":"时"}');
	});

	it('maps embedded wheel column labels to host message keys', () => {
		const labels = createHostTimeWheelColumnLabels();
		expect(labels.hour).toBe('ui.time.hour');
		expect(labels.columnAria('结束', '分')).toBe('ui.time.column:{"label":"结束","column":"分"}');
	});
});
