<script lang="ts">
	import { trackPluginAnalytics } from '@chronos/core';
	import type { ChronosUiController } from '@chronos/ui-kit';
	import {
		TimetableLivePreview,
		pluginText,
		type EdgeBarAction,
		type EdgeBarActionsController
	} from '@chronos/ui-kit';
	import { WALLPAPER_ANALYTICS } from './analytics';
	import WallpaperCropEditor from './WallpaperCropEditor.svelte';
	import { getWallpaperRuntime } from './runtime.svelte';
	import { WALLPAPER_MESSAGES } from './messages';
	import { WALLPAPER_PLUGIN_ID } from './storage';

	interface Props {
		controller: ChronosUiController;
		pluginId: string;
		edgeActions?: EdgeBarActionsController;
	}

	let { controller, pluginId, edgeActions }: Props = $props();

	const runtime = $derived(getWallpaperRuntime(pluginId));
	const wallpaperUri = $derived(runtime.uri);
	const hasWallpaper = $derived(runtime.hasWallpaper);
	const timetable = $derived(controller.currentTimetable);

	function pt(key: keyof (typeof WALLPAPER_MESSAGES)['zh-cn']) {
		return pluginText(controller, WALLPAPER_PLUGIN_ID, WALLPAPER_MESSAGES, key);
	}

	const pluginContext = $derived(controller.getPluginContext(pluginId));

	const previewEmpty = $derived(pt('screen.preview.empty'));
	const clearLabel = $derived(pt('screen.action.clear'));
	const pickLabel = $derived(pt(hasWallpaper ? 'screen.action.repick' : 'screen.action.pick'));

	let fileInput: HTMLInputElement | undefined = $state();
	let cropSource = $state<File | null>(null);
	const actions = $derived<EdgeBarAction[]>([
		...(hasWallpaper
			? [
					{
						id: 'clear',
						label: clearLabel,
						icon: 'delete',
						variant: 'outlined' as const,
						onClick: clearWallpaper
					}
				]
			: []),
		{
			id: 'pick',
			label: pickLabel,
			icon: 'wallpaper',
			onClick: onPickWallpaper
		}
	]);
	$effect(() => {
		if (cropSource) return;
		return edgeActions?.register(pluginId, actions);
	});

	function onPickWallpaper() {
		fileInput?.click();
	}

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		trackPluginAnalytics(pluginContext, WALLPAPER_PLUGIN_ID, WALLPAPER_ANALYTICS.pick);
		cropSource = file;
	}

	function onCropCancel() {
		trackPluginAnalytics(pluginContext, WALLPAPER_PLUGIN_ID, WALLPAPER_ANALYTICS.cropCancel);
		cropSource = null;
	}

	async function onCropConfirm(blob: Blob) {
		try {
			await runtime.setWallpaper(blob);
			trackPluginAnalytics(pluginContext, WALLPAPER_PLUGIN_ID, WALLPAPER_ANALYTICS.cropConfirm);
			cropSource = null;
		} catch (error) {
			const msg =
				error instanceof DOMException && error.name === 'QuotaExceededError'
					? pt('screen.error.tooLarge')
					: pt('screen.error.importFailed');
			controller.getPluginContext(pluginId).actions.notify(msg, 'error');
		}
	}

	async function clearWallpaper() {
		await runtime.setWallpaper(null);
		trackPluginAnalytics(pluginContext, WALLPAPER_PLUGIN_ID, WALLPAPER_ANALYTICS.clear);
	}
</script>

<div class="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={onFileChange}
	/>

	{#if cropSource}
		<WallpaperCropEditor
			{controller}
			{pluginId}
			{edgeActions}
			source={cropSource}
			onConfirm={onCropConfirm}
			onCancel={onCropCancel}
		/>
	{:else if hasWallpaper && timetable}
		<div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
			<TimetableLivePreview
				{controller}
				hasDynamicBackground={true}
				dynamicColorUri={wallpaperUri}
				fit="cover"
				interactive={false}
			/>
		</div>
	{:else}
		<div class="flex min-h-0 flex-1 items-center justify-center bg-canvas p-4">
			<p class="text-body-medium text-center text-on-surface-variant">{previewEmpty}</p>
		</div>
	{/if}

	{#if !cropSource}
		<div class="bottom-bar plugin-bottom-actions">
			<div class="mx-auto flex h-full w-full max-w-lg items-center gap-3">
				{#if hasWallpaper}
					<button type="button" class="ui-btn ui-btn-outlined flex-1" onclick={clearWallpaper}>
						{clearLabel}
					</button>
				{/if}
				<button type="button" class="ui-btn ui-btn-filled flex-1" onclick={onPickWallpaper}>
					{pickLabel}
				</button>
			</div>
		</div>
	{/if}
</div>
