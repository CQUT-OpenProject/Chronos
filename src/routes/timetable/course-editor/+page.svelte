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

<h1>编辑课程</h1>

{#if loading}
	<p>加载中…</p>
{:else if course}
	<p class="text-lg font-semibold">{course.name}</p>
	<p class="text-sm text-zinc-500">完整编辑 UI 将在后续里程碑提供。</p>
{:else}
	<p class="text-sm text-zinc-500">未找到课程</p>
{/if}

<a href={resolve('/')} class="mt-4 inline-block text-brand dark:text-soft-blue">返回课表</a>
