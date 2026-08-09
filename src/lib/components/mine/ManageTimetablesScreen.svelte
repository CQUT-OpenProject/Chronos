<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Radio from '$lib/components/ui/Radio.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';

	let {
		shell
	}: {
		shell: AppShellController;
	} = $props();

	const appState = $derived(shell.state.appState);
	const selectedTimetable = $derived(
		appState.timetables.find((timetable) => timetable.id === appState.currentTimetableId) ?? null
	);

	let deleteDialogOpen = $state(false);

	async function handleSwitch(id: string) {
		await shell.services.preferences.setCurrentTimetableId(id);
	}

	async function confirmDelete() {
		if (!appState.currentTimetableId) return;
		await shell.services.deleteTimetable.invoke(appState.currentTimetableId);
		deleteDialogOpen = false;
	}
</script>

{#snippet deleteFooter()}
	<Button
		variant="danger"
		class="w-full"
		disabled={appState.timetables.length <= 1}
		onclick={() => (deleteDialogOpen = true)}
	>
		删除课表
	</Button>
{/snippet}

<FormScreenLayout footer={deleteFooter}>
	<div class="flex flex-col gap-3">
		<h3 class="m3-title-medium px-1 font-semibold text-on-surface">我的课表</h3>

		<div class="flex flex-col gap-2.5">
			{#each appState.timetables as timetable (timetable.id)}
				{@const isActive = appState.currentTimetableId === timetable.id}
				<button
					type="button"
					class="flex min-h-[56px] w-full cursor-pointer items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-colors duration-200 {isActive
						? 'border-brand bg-primary-container/30 shadow-xs dark:border-soft-blue'
						: 'border-outline-variant/60 bg-surface hover:bg-surface-variant/30'}"
					onclick={() => handleSwitch(timetable.id)}
				>
					<Radio name="current-timetable" checked={isActive} />
					<div class="flex flex-col justify-center">
						<span class="m3-body-large font-medium text-on-surface">{timetable.name}</span>
						<span class="m3-body-small mt-0.5 text-on-surface-variant"
							>{timetable.courseCount} 门课程</span
						>
					</div>
				</button>
			{/each}
		</div>
	</div>
</FormScreenLayout>

<Dialog
	bind:open={deleteDialogOpen}
	title="删除课表？"
	description={selectedTimetable
		? `确定删除「${selectedTimetable.name}」吗？删除后无法恢复。`
		: '删除后无法恢复。'}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => (deleteDialogOpen = false)}>取消</Button>
		<Button variant="filled" onclick={confirmDelete}>删除</Button>
	{/snippet}
</Dialog>
