import { CHRONOS_MOUNTABLE, type ChronosMountable } from '@chronos/core';
import { mount, unmount, type Component } from 'svelte';

/**
 * Wraps an in-process Svelte component into the single `CHRONOS_MOUNTABLE`
 * protocol consumed by `MountableSlotOutlet`. Profile builtins (shared host
 * Svelte runtime) and self-contained ESM bundles satisfy the same interface,
 * so hosts never branch on component shape.
 */
export function mountableSvelteComponent<P extends Record<string, unknown>>(
	component: Component<P>
): ChronosMountable<P> {
	return {
		[CHRONOS_MOUNTABLE]: true,
		mount(target: HTMLElement, props: P) {
			const instance = mount(component, { target, props });
			return {
				unmount: () => {
					void unmount(instance);
				}
			};
		}
	};
}
