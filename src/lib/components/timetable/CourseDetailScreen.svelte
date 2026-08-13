<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { Course } from '$lib/models/course';
	import { resolveCoursePaint } from '$lib/parsers/course-palette';
	import { timetableDayLabel } from '$lib/timetable/day-labels';

	let {
		shell,
		courseId
	}: {
		shell: AppShellController;
		courseId: string | null;
	} = $props();

	let remarkExpanded = $state(true);

	const course = $derived(
		courseId
			? (shell.state.appState.currentTimetable?.courses.find((entry) => entry.id === courseId) ??
					null)
			: null
	);
	const paint = $derived(
		course ? resolveCoursePaint(course, shell.appearance.coursePalette) : null
	);

	function formatWeeks(weeks: number[]) {
		if (weeks.length === 0) return '全部周次';
		return weeks.join(', ');
	}

	function formatPeriodRange(entry: Course) {
		return entry.startPeriod === entry.endPeriod
			? `第 ${entry.startPeriod} 节`
			: `第 ${entry.startPeriod}-${entry.endPeriod} 节`;
	}

	const detailRows = $derived(
		course
			? [
					{ label: '授课教师', value: course.teacher.trim() || '-' },
					{ label: '上课地点', value: course.location.trim() || '-' },
					{
						label: '上课时间',
						value: timetableDayLabel(course.dayOfWeek)
					},
					{ label: '课程节次', value: formatPeriodRange(course) },
					{ label: '教学周次', value: formatWeeks(course.weeks) }
				]
			: []
	);
</script>

{#if !courseId}
	<p class="m3-body-medium text-on-surface-variant">未指定课程</p>
{:else if course}
	<div class="mb-6 flex items-center gap-3 py-2">
		<span class="size-3 shrink-0 rounded-full" style:background-color={paint?.background}></span>
		<h2 class="m3-headline-small flex-1 font-bold text-on-surface">{course.name}</h2>
	</div>

	<section class="rounded-2xl bg-surface-variant/40 p-4">
		<h3 class="m3-title-small mb-2 text-on-surface-variant">基本信息</h3>
		<div class="divide-y divide-outline-variant/60">
			{#each detailRows as row (row.label)}
				<div class="m3-body-medium flex items-center justify-between gap-4 py-2.5">
					<span class="text-on-surface-variant">{row.label}</span>
					<span class="text-right font-medium text-on-surface">{row.value}</span>
				</div>
			{/each}
		</div>
	</section>

	{#if course.remark.trim()}
		<section class="mt-4 rounded-2xl bg-surface-variant/40 p-4">
			<button
				type="button"
				class="m3-title-small flex w-full cursor-pointer items-center justify-between text-on-surface-variant"
				onclick={() => (remarkExpanded = !remarkExpanded)}
			>
				<span>备注</span>
				<span class="m3-label-large text-brand">{remarkExpanded ? '收起' : '展开'}</span>
			</button>
			{#if remarkExpanded}
				<p class="m3-body-medium mt-2 text-on-surface-variant" transition:slide={{ duration: 200 }}>
					{course.remark}
				</p>
			{/if}
		</section>
	{/if}
{:else}
	<p class="m3-body-medium text-on-surface-variant">未找到课程</p>
{/if}
