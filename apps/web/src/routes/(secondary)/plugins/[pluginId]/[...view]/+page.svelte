<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { ensureEngineFullyReady, getAppController } from '$lib/services/app-engine';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import { PluginScreenContainer, resolvePluginScreenSlot } from '@chronos/ui-kit';
	import { resolveLocalizedText } from '@chronos/core';

	const controller = getAppController();
	const pluginId = $derived(page.params.pluginId ?? '');
	const viewId = $derived(page.params.view || 'index');
	let ready = $state(false);

	const screenSlot = $derived(
		ready
			? resolvePluginScreenSlot(
					controller.getSlots('shell.route.screen'),
					pluginId,
					viewId,
					(slotId) => controller.resolveSlotOwner('shell.route.screen', slotId)
				)
			: undefined
	);

	onMount(async () => {
		await ensureEngineFullyReady();
		ready = true;
	});

	const pageTitle = $derived(
		resolveLocalizedText(screenSlot?.title, hostT('route.pluginPage'), controller.currentLocale)
	);
</script>

{#if ready}
	<SecondaryPageShell
		title={pageTitle}
		backFallback={{ kind: 'shell', tab: 'mine' }}
		flush
		landscapeRail={screenSlot?.landscapeRail}
		railPluginId={pluginId}
		railViewId={viewId}
	>
		<PluginScreenContainer {controller} {pluginId} {viewId} />
	</SecondaryPageShell>
{:else}
	<SecondaryPageShell
		title={hostT('route.pluginPage')}
		backFallback={{ kind: 'shell', tab: 'mine' }}
		flush
	>
		<div class="flex min-h-[40vh] items-center justify-center">
			<LoadingIndicator />
		</div>
	</SecondaryPageShell>
{/if}
