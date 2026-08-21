<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { TimetablePreviewGrid, TimetableWallpaperLayer } from '@chronos/ui-kit';
	import {
		AcademicCalendarService,
		computeTimetableWeekLayout,
		COURSE_PALETTE_ENTRIES,
		resolveCoursePalette,
		todayIsoDate
	} from '@chronos/core';
	import { getWallpaperRuntime } from './runtime.svelte';

	interface Props {
		controller: ReactiveChronosController;
		pluginId?: string;
	}

	let { controller }: Props = $props();

	const runtime = getWallpaperRuntime();
	const calendarService = new AcademicCalendarService();

	const timetable = $derived(controller.currentTimetable);
	const wallpaperUri = $derived(runtime.uri);
	const hasWallpaper = $derived(runtime.hasWallpaper);
	const paletteMode = $derived(controller.userPreferences?.paletteMode ?? 'vibrant');
	const coursePalette = $derived(resolveCoursePalette(paletteMode, COURSE_PALETTE_ENTRIES));
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
	let errorMessage = $state<string | null>(null);

	function onPickWallpaper() {
		fileInput?.click();
	}

	async function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		errorMessage = null;
		try {
			await runtime.setWallpaper(file);
		} catch (error) {
			errorMessage = resolveWallpaperImportError(error);
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
		errorMessage = null;
		await runtime.setWallpaper(null);
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
		<div class="min-h-0 flex-1">
			<TimetableWallpaperLayer {wallpaperUri}>
				<TimetablePreviewGrid
					displayedWeek={academicWeek}
					{gridModel}
					{courseDisplayModels}
					{coursePalette}
					hasWallpaper={true}
				/>
			</TimetableWallpaperLayer>
		</div>
	{:else}
		<p
			class="m3-body-medium flex flex-1 items-center justify-center p-4 text-center text-on-surface-variant"
		>
			选择壁纸后，可在此预览应用效果
		</p>
	{/if}

	{#if errorMessage}
		<p class="m3-body-small px-4 pb-2 text-center text-error">{errorMessage}</p>
	{/if}

	<div class="shrink-0 border-t border-outline/20 bg-surface p-4">
		<div class="flex w-full gap-3">
			{#if hasWallpaper}
				<button
					type="button"
					class="m3-label-large flex-1 rounded-full border border-outline px-4 py-3 text-on-surface"
					onclick={clearWallpaper}
				>
					清除壁纸
				</button>
			{/if}
			<button
				type="button"
				class="m3-label-large flex-1 rounded-full bg-primary px-4 py-3 text-on-primary"
				onclick={onPickWallpaper}
			>
				{hasWallpaper ? '重新选择' : '选择壁纸'}
			</button>
		</div>
	</div>
</div>
