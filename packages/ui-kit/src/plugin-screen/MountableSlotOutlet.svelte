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

	let mountHandle = $state<
		{ update?(props: Record<string, unknown>): void; unmount?(): void } | undefined
	>();

	$effect(() => {
		if (!containerEl || !mountable) {
			mountHandle = undefined;
			return;
		}

		const targetComponent = component;
		const initialProps = untrack(() => props);
		try {
			mountHandle = targetComponent.mount(containerEl, initialProps, parentContext);
		} catch (error) {
			console.error('[MountableSlotOutlet] mount failed:', error);
			mountHandle = undefined;
			return;
		}

		return () => {
			try {
				mountHandle?.unmount?.();
			} catch (error) {
				console.error('[MountableSlotOutlet] unmount failed:', error);
			} finally {
				mountHandle = undefined;
			}
		};
	});

	$effect(() => {
		if (!mountHandle?.update) return;
		mountHandle.update(props);
	});
</script>

{#if mountable}
	<div bind:this={containerEl} class={className}></div>
{/if}
