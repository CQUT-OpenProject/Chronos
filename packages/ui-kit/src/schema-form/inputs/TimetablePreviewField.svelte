<script lang="ts">
	import type { ReactiveChronosController } from '../../reactivity/engine-controller.svelte';
	import {
		AcademicCalendarService,
		computeTimetableWeekLayout,
		COURSE_PALETTE_ENTRIES,
		todayIsoDate
	} from '@chronos/core';
	import TimetablePreviewGrid from '../../timetable-preview/TimetablePreviewGrid.svelte';

	interface Props {
		controller?: ReactiveChronosController;
		label: string;
		description?: string;
	}

	let { controller, label, description = '' }: Props = $props();

	const calendarService = new AcademicCalendarService();

	const timetable = $derived(controller?.currentTimetable ?? null);
	const today = $derived(todayIsoDate());
	const academicWeek = $derived(
		calendarService.calculateAcademicWeek(today, timetable?.academicConfig)
	);
	const displayedWeek = $derived(
		controller?.displayedWeek ?? controller?.activeWeek ?? academicWeek ?? 1
	);
	const isCurrentWeek = $derived(displayedWeek === (academicWeek ?? controller?.activeWeek ?? 1));
	const currentPeriodIndex = $derived(controller?.currentPeriodIndex ?? null);
	const coursePalette = $derived(
		controller?.coursePalette && controller.coursePalette.length > 0
			? controller.coursePalette
			: COURSE_PALETTE_ENTRIES
	);
	const paletteCourses = $derived(timetable?.courses ?? []);
	const layoutMode = $derived(controller?.userPreferences?.timetableLayoutMode ?? 'fixed');
	const capsuleCornerStyle = $derived(controller?.userPreferences?.capsuleCornerStyle ?? 'rounded');
	const courseBadges = $derived(controller?.courseBadges ?? {});

	const preview = $derived(
		timetable
			? computeTimetableWeekLayout({
					timetable,
					displayedWeek,
					todayIso: today,
					academicCalendarService: calendarService,
					coursePalette,
					paletteCourses,
					layoutMode,
					capsuleCornerStyle
				})
			: null
	);
	const gridModel = $derived(preview?.gridModel ?? null);
	const courseDisplayModels = $derived(preview?.courseDisplayModels ?? []);
</script>

<div class="flex flex-col gap-1.5 text-left">
	<span class="text-sm font-medium text-on-surface">{label}</span>
	{#if description}
		<span class="text-xs text-on-surface-variant">{description}</span>
	{/if}
	<div class="overflow-hidden rounded-xl border border-outline/20">
		{#if timetable && gridModel}
			<div class="relative flex aspect-[9/16] max-h-[520px] w-full flex-col overflow-hidden">
				<TimetablePreviewGrid
					{displayedWeek}
					{gridModel}
					{courseDisplayModels}
					{coursePalette}
					{paletteCourses}
					hasDynamicBackground={false}
					{layoutMode}
					{capsuleCornerStyle}
					{isCurrentWeek}
					{currentPeriodIndex}
					{courseBadges}
					interactive={false}
				/>
			</div>
		{:else}
			<p
				class="text-body-medium flex items-center justify-center p-8 text-center text-on-surface-variant"
			>
				暂无课表，导入后可预览效果
			</p>
		{/if}
	</div>
</div>
