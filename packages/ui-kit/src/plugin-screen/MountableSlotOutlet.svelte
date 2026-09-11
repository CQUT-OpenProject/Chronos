<script lang="ts">
	import { getAllContexts, untrack } from 'svelte';
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
	const parentContext = getAllContexts();

	const mountable = $derived(isChronosMountable(component));

	$effect(() => {
		if (!containerEl || !mountable) return;
		const targetComponent = component;
		const initialProps = untrack(() => props);
		let instance: { unmount?(): void } | (() => void) | undefined;
		try {
			instance = targetComponent.mount(containerEl, initialProps, parentContext);
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
