<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getRepository } from '$lib/client/repository';
	import type { Course } from '$lib/models/course';

	let course = $state<Course | null>(null);
	let loading = $state(true);

	onMount(async () => {
		const courseId = page.url.searchParams.get('courseId');
		if (!courseId) {
			loading = false;
			return;
		}

		const snapshot = await getRepository().getAppStateSnapshot();
		course = snapshot.currentTimetable?.courses.find((entry) => entry.id === courseId) ?? null;
		loading = false;
	});
</script>

<h1>课程详情</h1>

{#if loading}
	<p>加载中…</p>
{:else if course}
	<p class="text-lg font-semibold">{course.name}</p>
	<p class="text-sm text-zinc-500">{course.teacher} · {course.location}</p>
{:else}
	<p class="text-sm text-zinc-500">未找到课程</p>
{/if}

<a href={resolve('/')} class="mt-4 inline-block text-blue-600">返回课表</a>
