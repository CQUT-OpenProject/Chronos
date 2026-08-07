<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { CourseDraft } from '$lib/models/drafts';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import CourseEditorForm from '$lib/components/timetable/CourseEditorForm.svelte';
	import { courseToDraft } from '$lib/timetable/timetable-mappers';

	const shell = getContext<AppShellController>('appShell');
	const timetable = $derived(shell.state.appState.currentTimetable);
	const courseId = $derived(page.url.searchParams.get('courseId'));

	let draft = $state<CourseDraft | null>(null);

	$effect(() => {
		if (!courseId) {
			draft = emptyDraft();
			return;
		}
		const snapshot = shell.state.appState.currentTimetable;
		const course = snapshot?.courses.find((entry) => entry.id === courseId);
		draft = course ? courseToDraft(course) : null;
	});

	async function save() {
		if (!timetable || !draft) return;
		await shell.services.saveCourse.invoke(timetable.id, draft);
		goto(resolve('/'));
	}

	async function deleteCourse() {
		if (!draft?.id) return;
		await shell.services.deleteCourse.invoke(draft.id);
		goto(resolve('/'));
	}

	function emptyDraft(): CourseDraft {
		return {
			name: '',
			teacher: '',
			location: '',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 1,
			color: '#EADDFF',
			textColor: '#21005D',
			weeks: [],
			remark: ''
		};
	}
</script>

{#snippet saveAction()}
	{#if draft}
		<button
			type="button"
			class="px-2 py-1 text-sm font-medium text-brand disabled:opacity-40 dark:text-soft-blue"
			disabled={!draft.name.trim()}
			onclick={save}
		>
			保存
		</button>
	{/if}
{/snippet}

<SecondaryPageShell title="编辑课程" backHref="/" actions={saveAction}>
	{#if draft}
		<CourseEditorForm
			bind:draft
			maxPeriods={timetable?.academicConfig.periodTimes.length ?? 10}
			onSave={save}
			onDelete={draft.id ? deleteCourse : undefined}
		/>
	{:else}
		<p class="text-sm text-on-surface-variant">未找到课程</p>
	{/if}
</SecondaryPageShell>
