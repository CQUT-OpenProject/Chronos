<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PluginScreenContainer } from '@chronos/ui-kit';
	import { getAppController } from '$lib/services/app-engine';

	const TAB_SLOT_ID = 'today';
	const controller = getAppController();
	const pluginId = $derived(controller.resolveSlotOwner('shell.bottom-bar.tab', TAB_SLOT_ID));

	onMount(() => {
		const tab = controller.getSlotItem('shell.bottom-bar.tab', TAB_SLOT_ID);
		if (!tab || !pluginId) {
			void goto(resolve('/'));
		}
	});
</script>

{#if pluginId}
	<PluginScreenContainer {controller} {pluginId} />
{/if}
