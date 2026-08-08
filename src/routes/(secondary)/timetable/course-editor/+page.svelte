<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import CourseEditorScreen from '$lib/components/timetable/CourseEditorScreen.svelte';
	import { createCourseEditor } from '$lib/timetable/course-editor.svelte';

	const shell = getContext<AppShellController>('appShell');
	const courseId = $derived(page.url.searchParams.get('courseId'));

	const editor = createCourseEditor(
		shell,
		() => courseId,
		() => goto(resolve('/'))
	);
</script>

{#snippet saveAction()}
	{#if editor.draft}
		<button
			type="button"
			class="px-2 py-1 text-sm font-medium text-brand disabled:opacity-40 dark:text-soft-blue"
			disabled={!editor.canSave}
			onclick={editor.save}
		>
			保存
		</button>
	{/if}
{/snippet}

<SecondaryPageShell title="编辑课程" backHref="/" actions={saveAction}>
	<CourseEditorScreen {editor} />
</SecondaryPageShell>
