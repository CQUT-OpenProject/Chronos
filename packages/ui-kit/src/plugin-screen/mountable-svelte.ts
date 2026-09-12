import { CHRONOS_MOUNTABLE, type ChronosMountable } from '@chronos/core';
import { mount, unmount, type Component } from 'svelte';
import { writable } from 'svelte/store';
import MountableSvelteHost from './MountableSvelteHost.svelte';

/**
 * Wraps an in-process Svelte component into the single `CHRONOS_MOUNTABLE`
 * protocol consumed by `MountableSlotOutlet`. Profile builtins (shared host
 * Svelte runtime) and self-contained ESM bundles satisfy the same interface,
 * so hosts never branch on component shape.
 *
 * Context forwarding (`MountableSlotOutlet` passes `getAllContexts()` into
 * `mount`) only works for in-process mountables that share the host Svelte
 * runtime (e.g. profile builtins). Self-contained official ESM bundles ship
 * their own Svelte copy; host context keys are not visible to `getContext()`
 * inside those components.
 */
export function mountableSvelteComponent<P extends Record<string, unknown>>(
	component: Component<P>
): ChronosMountable<P> {
	return {
		[CHRONOS_MOUNTABLE]: true,
		mount(target: HTMLElement, props: P, context?: Map<any, any>) {
			const propsStore = writable<Record<string, unknown>>({ ...props });
			const instance = mount(MountableSvelteHost, {
				target,
				props: {
					component: component as Component<Record<string, unknown>>,
					propsStore
				},
				context
			});

			return {
				update(nextProps: P) {
					propsStore.set({ ...nextProps });
				},
				unmount: () => {
					void unmount(instance);
				}
			};
		}
	};
}
