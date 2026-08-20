<script lang="ts">
	import { page } from '$app/state';
	import { getAppController } from '$lib/services/app-engine';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import { PluginScreenContainer } from '@chronos/ui-kit';

	const controller = getAppController();
	const pluginId = $derived(page.params.pluginId ?? '');
	const viewId = $derived(page.params.view || 'index');

	// Resolve the dynamic screen contribution from the shell.route.screen slot
	const screenSlot = $derived(
		controller
			.getSlots('shell.route.screen')
			.find((s) => s.id === viewId || s.id === `${pluginId}/${viewId}`)
	);

	const pageTitle = $derived(
		screenSlot
			? typeof screenSlot.title === 'function'
				? screenSlot.title()
				: screenSlot.title
			: '插件页面'
	);
</script>

<SecondaryPageShell title={pageTitle} backHref="/mine">
	<PluginScreenContainer {controller} {pluginId} {viewId} />
</SecondaryPageShell>
