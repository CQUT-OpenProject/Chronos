import type { ShellIconDescriptor } from '@chronos/core';
import { isShellIconDescriptor } from '@chronos/core';
import type { Component } from 'svelte';
import { SHELL_ICON_MAP } from '$lib/boot/mine-icons';

export type ResolvedShellIcon =
	| { kind: 'component'; component: Component<{ class?: string }> }
	| {
			kind: 'svg';
			markup: string;
			rotation?: number;
			opacity?: number;
			size?: ShellIconDescriptor['size'];
	  }
	| { kind: 'url'; url: string; size?: ShellIconDescriptor['size'] };

export function resolveShellIcon(ref: unknown): ResolvedShellIcon | undefined {
	if (ref === undefined || ref === null) {
		return undefined;
	}
	if (typeof ref === 'string' && ref in SHELL_ICON_MAP) {
		return {
			kind: 'component',
			component: SHELL_ICON_MAP[ref as keyof typeof SHELL_ICON_MAP]
		};
	}
	if (isShellIconDescriptor(ref)) {
		if (ref.type === 'registry' && ref.id && ref.id in SHELL_ICON_MAP) {
			return {
				kind: 'component',
				component: SHELL_ICON_MAP[ref.id as keyof typeof SHELL_ICON_MAP]
			};
		}
		if (ref.type === 'svg' && ref.markup) {
			return {
				kind: 'svg',
				markup: ref.markup,
				rotation: ref.rotation,
				opacity: ref.opacity,
				size: ref.size
			};
		}
		if (ref.type === 'url' && ref.url) {
			return { kind: 'url', url: ref.url, size: ref.size };
		}
	}
	return undefined;
}

export function shellIconSizeClass(size: ShellIconDescriptor['size'] | undefined): string {
	return size === 'large' ? 'size-8 sm:size-9' : 'size-[22px] sm:size-6';
}
