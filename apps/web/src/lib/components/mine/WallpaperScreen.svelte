<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import TimetableGrid from '$lib/components/timetable/TimetableGrid.svelte';
	import { AcademicCalendarService, computeTimetableWeekLayout, todayIsoDate } from '@chronos/core';
	import ActionBottomBar from '$lib/components/ui/ActionBottomBar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { LayersClearFill, PhotoLibraryFill } from '$lib/icons';

	let {
		shell
	}: {
		shell: AppShellController;
	} = $props();

	const calendarService = new AcademicCalendarService();

	const timetable = $derived(shell.controller.currentTimetable);
	const hasWallpaper = $derived(shell.state.hasWallpaper);
	const wallpaperUri = $derived(shell.state.wallpaperUri);
	const coursePalette = $derived(shell.appearance.coursePalette);
	const today = $derived(todayIsoDate());
	const academicWeek = $derived(
		calendarService.calculateAcademicWeek(today, timetable?.academicConfig)
	);
	const preview = $derived(
		timetable
			? computeTimetableWeekLayout({
					timetable,
					displayedWeek: academicWeek,
					todayIso: today,
					academicCalendarService: calendarService
				})
			: null
	);
	const gridModel = $derived(preview?.gridModel ?? null);
	const courseDisplayModels = $derived(preview?.courseDisplayModels ?? []);

	let fileInput: HTMLInputElement | undefined = $state();

	function onPickWallpaper() {
		fileInput?.click();
	}

	async function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		trackEvent('wallpaper_set');
		try {
			await shell.setWallpaper(file);
		} catch (error) {
			snackbar(resolveWallpaperImportError(error));
		} finally {
			input.value = '';
		}
	}

	function resolveWallpaperImportError(error: unknown): string {
		if (error instanceof DOMException && error.name === 'QuotaExceededError') {
			return '此图片过大，无法导入';
		}
		return '壁纸导入失败，请重试';
	}

	async function clearWallpaper() {
		trackEvent('wallpaper_clear');
		await shell.setWallpaper(null);
	}
</script>

<div class="flex h-full min-h-0 flex-1 flex-col">
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={onFileChange}
	/>

	{#if hasWallpaper && timetable && gridModel}
		<div
			class="relative min-h-0 flex-1 overflow-hidden"
			style:background-image={wallpaperUri ? `url('${wallpaperUri}')` : undefined}
			style:background-size="cover"
			style:background-position="center"
		>
			<div class="absolute inset-0">
				<TimetableGrid
					displayedWeek={academicWeek}
					isCurrentWeek={true}
					{gridModel}
					{courseDisplayModels}
					hasWallpaper={true}
					{coursePalette}
					paletteCourses={timetable.courses}
				/>
			</div>
		</div>
	{:else}
		<p
			class="m3-body-medium flex flex-1 items-center justify-center p-4 text-center text-on-surface-variant"
		>
			选择壁纸后，可在此预览应用效果
		</p>
	{/if}

	<ActionBottomBar>
		<div class="flex w-full gap-3">
			{#if hasWallpaper}
				<Button variant="outlined" class="w-full flex-1" onclick={clearWallpaper}>
					<LayersClearFill class="size-5" />
					清除壁纸
				</Button>
			{/if}
			<Button variant="filled" class="w-full flex-1" onclick={onPickWallpaper}>
				<PhotoLibraryFill class="size-5" />
				{hasWallpaper ? '重新选择' : '选择壁纸'}
			</Button>
		</div>
	</ActionBottomBar>
</div>
