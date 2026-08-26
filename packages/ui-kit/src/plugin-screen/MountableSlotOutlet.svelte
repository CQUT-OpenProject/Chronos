<script lang="ts">
	import { isChronosMountable } from '@chronos/core';

	interface Props {
		/** A contribution whose `component` may be a CHRONOS_MOUNTABLE bundle UI. */
		component: unknown;
		/** Props forwarded to `mount(target, props)`. */
		props?: Record<string, unknown>;
		class?: string;
	}

	let { component, props = {}, class: className = undefined }: Props = $props();

	let containerEl = $state<HTMLDivElement>();

	const mountable = $derived(isChronosMountable(component));

	$effect(() => {
		if (!containerEl || !mountable) return;
		let instance: { unmount?(): void } | (() => void) | undefined;
		try {
			instance = component.mount(containerEl, props);
		} catch (error) {
			console.error('[MountableSlotOutlet] mount failed:', error);
			return;
		}
		return () => {
			try {
				if (typeof instance === 'function') {
					instance();
				} else if (typeof instance?.unmount === 'function') {
					instance.unmount();
				}
			} catch (error) {
				console.error('[MountableSlotOutlet] unmount failed:', error);
			}
		};
	});
</script>

{#if mountable}
	<div bind:this={containerEl} class={className}></div>
{/if}
