<script lang="ts">
	import { getContext } from 'svelte';
	import { fromStore } from 'svelte/store';
	import type { ChronosUiController } from '../../reactivity/chronos-ui-controller';
	import { AcademicCalendarService, computeTimetableWeekLayout, todayIsoDate } from '@chronos/core';
	import TimetablePreviewGrid from '../../timetable-preview/TimetablePreviewGrid.svelte';
	import {
		TIMETABLE_PRESENTATION_CONTEXT,
		resolveCoursePalette,
		resolveDisplayedWeek,
		type TimetablePresentationSource
	} from '../../timetable-preview/timetable-presentation';

	interface Props {
		controller?: ChronosUiController;
		label: string;
		description?: string;
	}

	let { controller, label, description = '' }: Props = $props();

	const presentationSource = getContext<TimetablePresentationSource | undefined>(
		TIMETABLE_PRESENTATION_CONTEXT
	);
	const calendarService = new AcademicCalendarService();
	const ui = $derived(controller ? fromStore(controller.snapshot) : null);
	const presentationView = $derived(presentationSource ? fromStore(presentationSource) : null);

	const timetable = $derived(ui?.current.currentTimetable ?? null);
	const today = $derived(ui?.current.clockTodayIso ?? todayIsoDate());
	const academicWeek = $derived(
		calendarService.calculateAcademicWeek(today, timetable?.academicConfig)
	);
	const presentation = $derived(presentationView?.current ?? {});
	const activeWeek = $derived(ui?.current.activeWeek ?? academicWeek);
	const displayedWeek = $derived(resolveDisplayedWeek(presentation, academicWeek, activeWeek));
	const isCurrentWeek = $derived(displayedWeek === (academicWeek ?? activeWeek ?? 1));
	const currentPeriodIndex = $derived(ui?.current.currentPeriodIndex ?? null);
	const coursePalette = $derived(resolveCoursePalette(presentation));
	const paletteCourses = $derived(timetable?.courses ?? []);
	const layoutMode = $derived(ui?.current.userPreferences?.timetableLayoutMode ?? 'fixed');
	const capsuleCornerStyle = $derived(ui?.current.userPreferences?.capsuleCornerStyle ?? 'sharp');
	const courseBadges = $derived(ui?.current.courseBadges ?? {});
	const hostTranslate = $derived(
		controller ? (key: string) => controller.translatePlugin('host-ui', key) : (key: string) => key
	);

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
					{hostTranslate}
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
