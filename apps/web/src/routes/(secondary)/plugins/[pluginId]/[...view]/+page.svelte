<script lang="ts">
	import { page } from '$app/state';
	import { getAppController } from '$lib/services/app-engine';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import { PluginScreenContainer, resolvePluginScreenSlot } from '@chronos/ui-kit';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
	const pluginId = $derived(page.params.pluginId ?? '');
	const viewId = $derived(page.params.view || 'index');

	const screenSlot = $derived(
		resolvePluginScreenSlot(controller.getSlots('shell.route.screen'), pluginId, viewId)
	);

	const pageTitle = $derived(
		screenSlot
			? typeof screenSlot.title === 'function'
				? screenSlot.title()
				: screenSlot.title
			: hostTextRead(controller, 'route.pluginPage')
	);
	const isRich = $derived(Boolean(screenSlot?.component));
</script>

<SecondaryPageShell title={pageTitle} backHref="/mine" flush={isRich}>
	<PluginScreenContainer {controller} {pluginId} {viewId} />
</SecondaryPageShell>
