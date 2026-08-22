import { describe, expect, it, vi } from 'vite-plus/test';
import type { Component } from 'svelte';

const { mockCalendarMonth } = vi.hoisted(() => ({
	mockCalendarMonth: {} as Component<{ class?: string }>
}));

vi.mock('$lib/boot/mine-icons', () => ({
	SHELL_ICON_MAP: {
		'calendar-month': mockCalendarMonth
	}
}));

import { resolveShellIcon } from './resolve-shell-icon';

describe('resolveShellIcon', () => {
	it('resolves registered string keys to icon components', () => {
		expect(resolveShellIcon('calendar-month')).toBe(mockCalendarMonth);
	});

	it('returns undefined for unknown string keys', () => {
		expect(resolveShellIcon('not-a-real-icon')).toBeUndefined();
	});

	it('returns Svelte components passed directly', () => {
		const CustomIcon = {} as Component<{ class?: string }>;
		expect(resolveShellIcon(CustomIcon)).toBe(CustomIcon);
	});

	it('returns undefined for nullish refs', () => {
		expect(resolveShellIcon(undefined)).toBeUndefined();
	});
});
