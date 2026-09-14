<script lang="ts">
	import type { Component } from 'svelte';
	import type { Readable } from 'svelte/store';
	import { fromStore } from 'svelte/store';

	interface Props {
		component: Component<Record<string, unknown>>;
		propsStore: Readable<Record<string, unknown>>;
	}

	let { component, propsStore }: Props = $props();
	const ResolvedComponent = $derived(component);
	const resolvedProps = $derived.by(() => fromStore(propsStore).current);
</script>

<div class="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
	<ResolvedComponent {...resolvedProps} />
</div>
