<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { StandardSlotMap } from '@chronos/core';
	import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';

	interface Props<K extends keyof StandardSlotMap> {
		controller: ReactiveChronosController;
		name: K;
		children?: Snippet<[items: Array<StandardSlotMap[K]>]>;
	}

	let { controller, name, children }: Props<keyof StandardSlotMap> = $props();

	// Reactively derive registered slot contributions from controller
	const slotItems = $derived(controller.getSlots(name));
</script>

{#if children}
	{@render children(slotItems)}
{/if}
