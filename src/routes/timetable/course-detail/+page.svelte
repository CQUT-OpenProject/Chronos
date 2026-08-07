<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { Course } from '$lib/models/course';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import { Edit } from '$lib/icons';
	import { timetableDayLabel } from '$lib/timetable/timetable-grid-logic';

	const shell = getContext<AppShellController>('appShell');
	const courseId = $derived(page.url.searchParams.get('courseId'));

	let course = $state<Course | null>(null);
	let remarkExpanded = $state(true);

	$effect(() => {
		if (!courseId) {
			course = null;
			return;
		}
		const snapshot = shell.state.appState.currentTimetable;
		course = snapshot?.courses.find((entry) => entry.id === courseId) ?? null;
	});

	function editCourse() {
		if (!course) return;
		goto(resolve(`/timetable/course-editor?courseId=${encodeURIComponent(course.id)}`));
	}

	function formatWeeks(weeks: number[]) {
		if (weeks.length === 0) return '全部周次';
		return weeks.join(', ');
	}

	function formatPeriodRange(course: Course) {
		return course.startPeriod === course.endPeriod
			? `第 ${course.startPeriod} 节`
			: `第 ${course.startPeriod}-${course.endPeriod} 节`;
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

{#snippet editAction()}
	<button
		type="button"
		class="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-on-surface hover:bg-surface-variant/50"
		aria-label="编辑课程"
		onclick={editCourse}
	>
		<Edit class="size-[22px]" />
	</button>
{/snippet}

<SecondaryPageShell title="课程详情" backHref="/" actions={editAction}>
	{#if !courseId}
		<p class="text-sm text-on-surface-variant">未指定课程</p>
	{:else if course}
		<div class="mb-6 flex items-center gap-3 py-2">
			<span class="size-3 shrink-0 rounded-full" style:background-color={course.color}></span>
			<h2 class="flex-1 text-2xl font-bold text-on-surface">{course.name}</h2>
		</div>

		<section class="rounded-2xl bg-surface-variant/40 p-4">
			<h3 class="mb-2 text-sm font-semibold text-on-surface-variant">基本信息</h3>
			<div class="divide-y divide-outline-variant/60">
				{#each detailRows as row (row.label)}
					<div class="flex items-center justify-between gap-4 py-2.5 text-sm">
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
					class="flex w-full cursor-pointer items-center justify-between text-sm font-semibold text-on-surface-variant"
					onclick={() => (remarkExpanded = !remarkExpanded)}
				>
					<span>备注</span>
					<span class="text-xs text-brand dark:text-soft-blue"
						>{remarkExpanded ? '收起' : '展开'}</span
					>
				</button>
				{#if remarkExpanded}
					<p class="mt-2 text-sm text-on-surface-variant" transition:slide={{ duration: 200 }}>
						{course.remark}
					</p>
				{/if}
			</section>
		{/if}
	{:else}
		<p class="text-sm text-on-surface-variant">未找到课程</p>
	{/if}
</SecondaryPageShell>
