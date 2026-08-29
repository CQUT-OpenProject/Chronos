<script lang="ts">
	import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';
	import {
		AcademicCalendarService,
		computeTimetableWeekLayout,
		COURSE_PALETTE_ENTRIES,
		todayIsoDate
	} from '@chronos/core';
	import TimetablePreviewGrid from './TimetablePreviewGrid.svelte';
	import TimetableWallpaperLayer from './TimetableWallpaperLayer.svelte';

	interface Props {
		controller: ReactiveChronosController;
		hasDynamicBackground?: boolean;
		dynamicColorUri?: string | null;
		interactive?: boolean;
	}

	let {
		controller,
		hasDynamicBackground = false,
		dynamicColorUri = null,
		interactive = false
	}: Props = $props();

	const calendarService = new AcademicCalendarService();

	const timetable = $derived(controller.currentTimetable);
	const today = $derived(todayIsoDate());
	const academicWeek = $derived(
		timetable ? calendarService.calculateAcademicWeek(today, timetable.academicConfig) : null
	);
	const displayedWeek = $derived(
		controller.displayedWeek ?? controller.activeWeek ?? academicWeek ?? 1
	);
	const isCurrentWeek = $derived(displayedWeek === (academicWeek ?? controller.activeWeek ?? 1));
	const currentPeriodIndex = $derived(controller.currentPeriodIndex);
	const layoutMode = $derived(controller.userPreferences?.timetableLayoutMode ?? 'fixed');
	const capsuleCornerStyle = $derived(controller.userPreferences?.capsuleCornerStyle ?? 'rounded');
	const resolvedPalette = $derived(
		controller.coursePalette.length > 0 ? controller.coursePalette : COURSE_PALETTE_ENTRIES
	);
	const paletteCourses = $derived(timetable?.courses ?? []);
	const courseBadges = $derived(controller.courseBadges ?? {});

	const preview = $derived(
		timetable
			? computeTimetableWeekLayout({
					timetable,
					displayedWeek,
					todayIso: today,
					academicCalendarService: calendarService,
					coursePalette: resolvedPalette,
					paletteCourses,
					layoutMode,
					capsuleCornerStyle
				})
			: null
	);
	const gridModel = $derived(preview?.gridModel ?? null);
	const courseDisplayModels = $derived(preview?.courseDisplayModels ?? []);
</script>

{#if timetable && gridModel}
	<TimetableWallpaperLayer
		wallpaperUri={hasDynamicBackground && dynamicColorUri ? dynamicColorUri : null}
	>
		<TimetablePreviewGrid
			{displayedWeek}
			{gridModel}
			{courseDisplayModels}
			coursePalette={resolvedPalette}
			{paletteCourses}
			hasDynamicBackground={hasDynamicBackground && Boolean(dynamicColorUri)}
			{layoutMode}
			{capsuleCornerStyle}
			{interactive}
			{isCurrentWeek}
			{currentPeriodIndex}
			{courseBadges}
		/>
	</TimetableWallpaperLayer>
{:else}
	<div class="flex min-h-[12rem] items-center justify-center p-8">
		<p class="text-body-medium text-center text-on-surface-variant">暂无课表，导入后可预览效果</p>
	</div>
{/if}
