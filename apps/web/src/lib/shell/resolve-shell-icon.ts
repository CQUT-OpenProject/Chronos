import type { ShellIconRef } from '@chronos/core';
import type { Component } from 'svelte';
import { SHELL_ICON_MAP } from '$lib/boot/mine-icons';

export function resolveShellIcon(
	ref: ShellIconRef | undefined
): Component<{ class?: string }> | undefined {
	if (ref === undefined || ref === null) {
		return undefined;
	}
	if (typeof ref === 'string' && ref in SHELL_ICON_MAP) {
		return SHELL_ICON_MAP[ref as keyof typeof SHELL_ICON_MAP];
	}
	if (typeof ref !== 'string') {
		return ref as Component<{ class?: string }>;
	}
	return undefined;
}
