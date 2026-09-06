<script lang="ts">
	import type { Course, CoursePaletteEntry } from '@chronos/core';
	import {
		assignCourseDisplayColors,
		COURSE_PALETTE_ENTRIES,
		listDistinctCourses
	} from '@chronos/core';
	import MiddleTruncateText from '../timetable-preview/MiddleTruncateText.svelte';

	let {
		courses,
		coursePalette = COURSE_PALETTE_ENTRIES
	}: {
		courses: Course[];
		coursePalette?: readonly CoursePaletteEntry[];
	} = $props();

	const distinctCourses = $derived(listDistinctCourses(courses));
	const paintsByName = $derived(assignCourseDisplayColors(courses, coursePalette));
</script>

<ul class="flex flex-col gap-1.5" role="list">
	{#each distinctCourses as course (course.name)}
		{@const paint = paintsByName.get(course.name) ?? coursePalette[0]!}
		<li class="flex min-h-8 items-center gap-2.5 py-0.5">
			<span
				class="size-2 shrink-0 rounded-full"
				style:background-color={paint.background}
				aria-hidden="true"
			></span>
			<MiddleTruncateText
				text={course.name}
				class="text-body-medium min-w-0 flex-1 text-on-surface"
			/>
		</li>
	{/each}
</ul>
