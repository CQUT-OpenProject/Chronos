<script lang="ts">
	import type { ReactiveChronosController } from '../../reactivity/engine-controller.svelte';
	import {
		AcademicCalendarService,
		computeTimetableWeekLayout,
		todayIsoDate,
		COURSE_PALETTE_ENTRIES
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
</script>

<div class="flex flex-col gap-1.5 text-left">
	<span class="text-sm font-medium text-on-surface">{label}</span>
	{#if description}
		<span class="text-xs text-on-surface-variant">{description}</span>
	{/if}
	<div class="overflow-hidden rounded-xl border border-outline/20">
		{#if timetable && gridModel}
			<TimetablePreviewGrid
				displayedWeek={academicWeek}
				{gridModel}
				{courseDisplayModels}
				coursePalette={COURSE_PALETTE_ENTRIES}
				hasWallpaper={false}
			/>
		{:else}
			<p
				class="m3-body-medium flex items-center justify-center p-8 text-center text-on-surface-variant"
			>
				暂无课表，导入后可预览效果
			</p>
		{/if}
	</div>
</div>
