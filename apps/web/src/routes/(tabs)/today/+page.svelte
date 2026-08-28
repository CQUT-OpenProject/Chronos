<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PluginScreenContainer } from '@chronos/ui-kit';
	import { getAppController } from '$lib/services/app-engine';

	const TODAY_PLUGIN_ID = 'tool-today';
	const controller = getAppController();

	onMount(() => {
		const tab = controller.getSlotItem('shell.bottom-bar.tab', 'today');
		if (!tab) {
			void goto(resolve('/'));
		}
	});
</script>

<PluginScreenContainer {controller} pluginId={TODAY_PLUGIN_ID} />
