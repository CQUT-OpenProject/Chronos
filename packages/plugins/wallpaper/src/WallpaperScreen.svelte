<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { TimetableLivePreview } from '@chronos/ui-kit';
	import { getWallpaperRuntime } from './runtime.svelte';

	interface Props {
		controller: ReactiveChronosController;
		pluginId: string;
	}

	let { controller, pluginId }: Props = $props();

	const runtime = getWallpaperRuntime(pluginId);
	const wallpaperUri = $derived(runtime.uri);
	const hasWallpaper = $derived(runtime.hasWallpaper);
	const timetable = $derived(controller.currentTimetable);

	let fileInput: HTMLInputElement | undefined = $state();

	function onPickWallpaper() {
		fileInput?.click();
	}

	async function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			await runtime.setWallpaper(file);
		} catch (error) {
			const msg =
				error instanceof DOMException && error.name === 'QuotaExceededError'
					? '此图片过大，无法导入'
					: '壁纸导入失败，请重试';
			try {
				controller.getPluginContext(pluginId).actions.notify(msg, 'error');
			} catch {
				alert(msg);
			}
		} finally {
			input.value = '';
		}
	}

	async function clearWallpaper() {
		await runtime.setWallpaper(null);
	}
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={onFileChange}
	/>

	{#if hasWallpaper && timetable}
		<div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
			<TimetableLivePreview {controller} hasWallpaper={true} {wallpaperUri} interactive={false} />
		</div>
	{:else}
		<div class="flex min-h-0 flex-1 items-center justify-center bg-canvas p-4">
			<p class="m3-body-medium text-center text-on-surface-variant">
				选择壁纸后，可在此预览应用效果
			</p>
		</div>
	{/if}

	<div class="bottom-bar">
		<div class="mx-auto flex h-full w-full max-w-lg items-center gap-3">
			{#if hasWallpaper}
				<button
					type="button"
					class="flex flex-1 items-center justify-center gap-2 rounded-full border border-outline bg-surface px-4 py-3 text-sm font-medium text-on-surface"
					onclick={clearWallpaper}
				>
					清除壁纸
				</button>
			{/if}
			<button
				type="button"
				class="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-on-primary"
				onclick={onPickWallpaper}
			>
				{hasWallpaper ? '重新选择' : '选择壁纸'}
			</button>
		</div>
	</div>
</div>
