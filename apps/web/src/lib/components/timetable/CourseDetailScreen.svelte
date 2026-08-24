<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { Course } from '@chronos/core';
	import {
		assignCourseDisplayColors,
		normalizedCourseName,
		resolveCoursePaint,
		resolveLocalizedText
	} from '@chronos/core';
	import { timetableDayLabel } from '@chronos/ui-kit/timetable-preview/day-labels';
	import { getAppController } from '$lib/services/app-engine';
	import Button from '$lib/components/ui/Button.svelte';
	import { hostTextRead } from '$lib/i18n/host-text';

	let {
		shell,
		courseId
	}: {
		shell: AppShellController;
		courseId: string | null;
	} = $props();

	let remarkExpanded = $state(true);
	const controller = getAppController();
	const courseActions = $derived(controller.getSlots('course.detail.action'));

	const course = $derived(
		courseId
			? (shell.controller.currentTimetable?.courses.find((entry) => entry.id === courseId) ?? null)
			: null
	);
	const paint = $derived.by(() => {
		if (!course) return null;
		const palette = shell.appearance.coursePalette;
		const assigned = assignCourseDisplayColors(
			shell.controller.currentTimetable?.courses ?? [],
			palette
		);
		return assigned.get(normalizedCourseName(course.name)) ?? resolveCoursePaint(course, palette);
	});

	function formatWeeks(weeks: number[]) {
		if (weeks.length === 0) return hostTextRead(controller, 'course.detail.allWeeks');
		return weeks.join(', ');
	}

	function formatPeriodRange(entry: Course) {
		return entry.startPeriod === entry.endPeriod
			? hostTextRead(controller, 'course.detail.periodSingle', { n: entry.startPeriod })
			: hostTextRead(controller, 'course.detail.periodRange', {
					start: entry.startPeriod,
					end: entry.endPeriod
				});
	}

	const detailRows = $derived(
		course
			? [
					{
						label: hostTextRead(controller, 'course.detail.teacher'),
						value: course.teacher.trim() || '-'
					},
					{
						label: hostTextRead(controller, 'course.detail.location'),
						value: course.location.trim() || '-'
					},
					{
						label: hostTextRead(controller, 'course.detail.time'),
						value: timetableDayLabel(course.dayOfWeek)
					},
					{
						label: hostTextRead(controller, 'course.detail.periods'),
						value: formatPeriodRange(course)
					},
					{
						label: hostTextRead(controller, 'course.detail.weeks'),
						value: formatWeeks(course.weeks)
					}
				]
			: []
	);
</script>

{#if !courseId}
	<p class="m3-body-medium text-on-surface-variant">
		{hostTextRead(controller, 'course.detail.noId')}
	</p>
{:else if course}
	<div class="mb-6 flex items-center gap-3 py-2">
		<span
			class="course-capsule size-3 shrink-0 rounded-full"
			style:--capsule={paint?.background}
			style:--capsule-fg={paint?.foreground}
		></span>
		<h2 class="m3-headline-small flex-1 font-bold text-on-surface">{course.name}</h2>
	</div>

	<section class="rounded-2xl bg-surface-variant/40 p-4">
		<h3 class="m3-title-small mb-2 text-on-surface-variant">
			{hostTextRead(controller, 'course.detail.basicInfo')}
		</h3>
		<div class="divide-y divide-outline-variant/60">
			{#each detailRows as row (row.label)}
				<div class="m3-body-medium flex items-center justify-between gap-4 py-2.5">
					<span class="text-on-surface-variant">{row.label}</span>
					<span class="text-right font-medium text-on-surface">{row.value}</span>
				</div>
			{/each}
		</div>
	</section>

	{#if courseActions.length > 0}
		<section class="mt-4 rounded-2xl bg-surface-variant/40 p-4">
			<h3 class="m3-title-small mb-2 text-on-surface-variant">
				{hostTextRead(controller, 'course.detail.pluginActions')}
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each courseActions as action (action.id)}
					<Button
						variant="tonal"
						onclick={() => {
							const ctx = controller.getPluginContextForSlot('course.detail.action', action.id);
							void action.onExecute(course, ctx);
						}}
					>
						{resolveLocalizedText(action.label)}
					</Button>
				{/each}
			</div>
		</section>
	{/if}

	{#if course.remark.trim()}
		<section class="mt-4 rounded-2xl bg-surface-variant/40 p-4">
			<button
				type="button"
				class="m3-title-small flex w-full cursor-pointer items-center justify-between text-on-surface-variant"
				onclick={() => (remarkExpanded = !remarkExpanded)}
			>
				<span>{hostTextRead(controller, 'course.detail.remark')}</span>
				<span class="m3-label-large text-brand">
					{hostTextRead(
						controller,
						remarkExpanded ? 'course.detail.collapse' : 'course.detail.expand'
					)}
				</span>
			</button>
			{#if remarkExpanded}
				<p class="m3-body-medium mt-2 text-on-surface-variant" transition:slide={{ duration: 200 }}>
					{course.remark}
				</p>
			{/if}
		</section>
	{/if}
{:else}
	<p class="m3-body-medium text-on-surface-variant">
		{hostTextRead(controller, 'course.detail.notFound')}
	</p>
{/if}
