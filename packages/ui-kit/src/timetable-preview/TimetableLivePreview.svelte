<script lang="ts">
	import type { ChronosUiController } from '../reactivity/chronos-ui-controller';
	import {
		AcademicCalendarService,
		computeTimetableWeekLayout,
		COURSE_PALETTE_ENTRIES
	} from '@chronos/core';
	import TimetablePreviewGrid from './TimetablePreviewGrid.svelte';
	import TimetableWallpaperLayer from './TimetableWallpaperLayer.svelte';

	interface Props {
		controller: ChronosUiController;
		displayedWeek?: number;
		coursePalette?: readonly CoursePaletteEntry[];
		hasDynamicBackground?: boolean;
		dynamicColorUri?: string | null;
		interactive?: boolean;
	}

	let {
		controller,
		displayedWeek: propDisplayedWeek,
		coursePalette: propCoursePalette,
		hasDynamicBackground = false,
		dynamicColorUri = null,
		interactive = false
	}: Props = $props();

	const calendarService = new AcademicCalendarService();
	const hostTranslate = (key: string) => controller.translatePlugin('host-ui', key);

	const timetable = $derived(controller.currentTimetable);
	const today = $derived(controller.clockTodayIso);
	const academicWeek = $derived(
		timetable ? calendarService.calculateAcademicWeek(today, timetable.academicConfig) : null
	);
	const displayedWeek = $derived(propDisplayedWeek ?? controller.activeWeek ?? academicWeek ?? 1);
	const isCurrentWeek = $derived(displayedWeek === (academicWeek ?? controller.activeWeek ?? 1));
	const currentPeriodIndex = $derived(controller.currentPeriodIndex);
	const layoutMode = $derived(controller.userPreferences?.timetableLayoutMode ?? 'fixed');
	const capsuleCornerStyle = $derived(controller.userPreferences?.capsuleCornerStyle ?? 'sharp');
	const resolvedPalette = $derived(
		propCoursePalette && propCoursePalette.length > 0 ? propCoursePalette : COURSE_PALETTE_ENTRIES
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
			{hostTranslate}
		/>
	</TimetableWallpaperLayer>
{:else}
	<div class="flex min-h-[12rem] items-center justify-center p-8">
		<p class="text-body-medium text-center text-on-surface-variant">暂无课表，导入后可预览效果</p>
	</div>
{/if}
