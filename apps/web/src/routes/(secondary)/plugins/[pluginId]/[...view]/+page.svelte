<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import WallpaperScreen from '$lib/components/mine/WallpaperScreen.svelte';
	import { PluginScreenContainer, resolvePluginScreenSlot } from '@chronos/ui-kit';

	const shell = getContext<AppShellController>('appShell');
	const controller = getAppController();
	const pluginId = $derived(page.params.pluginId ?? '');
	const viewId = $derived(page.params.view || 'index');
	const isWallpaperPlugin = $derived(pluginId === 'tool-wallpaper');

	const screenSlot = $derived(
		resolvePluginScreenSlot(controller.getSlots('shell.route.screen'), pluginId, viewId)
	);

	const pageTitle = $derived(
		isWallpaperPlugin
			? '设置课表壁纸'
			: screenSlot
				? typeof screenSlot.title === 'function'
					? screenSlot.title()
					: screenSlot.title
				: '插件页面'
	);
</script>

<SecondaryPageShell title={pageTitle} backHref="/mine" flush={isWallpaperPlugin}>
	{#if isWallpaperPlugin}
		<WallpaperScreen {shell} />
	{:else}
		<PluginScreenContainer {controller} {pluginId} {viewId} />
	{/if}
</SecondaryPageShell>
