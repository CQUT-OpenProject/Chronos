import { describe, expect, it, vi } from 'vite-plus/test';

const { mockCalendarMonth } = vi.hoisted(() => ({
	mockCalendarMonth: {} as import('svelte').Component<{ class?: string }>
}));

vi.mock('$lib/boot/mine-icons', () => ({
	SHELL_ICON_MAP: {
		'calendar-month': mockCalendarMonth
	}
}));

import { resolveShellIcon } from './resolve-shell-icon';

describe('resolveShellIcon', () => {
	it('resolves registered string keys to icon components', () => {
		expect(resolveShellIcon('calendar-month')).toEqual({
			kind: 'component',
			component: mockCalendarMonth
		});
	});

	it('returns undefined for unknown string keys', () => {
		expect(resolveShellIcon('not-a-real-icon')).toBeUndefined();
	});

	it('resolves inline SVG icons', () => {
		const svg = { type: 'svg' as const, markup: '<svg></svg>' };
		expect(resolveShellIcon(svg)).toEqual({ kind: 'svg', markup: '<svg></svg>' });
	});

	it('resolves registry descriptor to host icon components', () => {
		expect(resolveShellIcon({ type: 'registry', id: 'calendar-month' })).toEqual({
			kind: 'component',
			component: mockCalendarMonth
		});
	});

	it('returns undefined for nullish refs', () => {
		expect(resolveShellIcon(undefined)).toBeUndefined();
	});
});
