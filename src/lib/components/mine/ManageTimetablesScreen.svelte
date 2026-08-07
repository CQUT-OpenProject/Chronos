<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { Add, CheckCircleFill, Delete } from '$lib/icons';
	import { Button, Dialog, ListItem, TextFieldOutlined } from 'm3-svelte';

	let {
		shell,
		onBack
	}: {
		shell: AppShellController;
		onBack: () => void;
	} = $props();

	const appState = $derived(shell.state.appState);
	let creating = $state(false);
	let newName = $state('');
	let pendingDeleteId = $state<string | null>(null);
	let deleteDialogOpen = $state(false);

	async function handleCreate() {
		const name = newName.trim();
		if (!name) return;
		await shell.services.createTimetable.invoke(name);
		creating = false;
		newName = '';
	}

	async function handleSwitch(id: string) {
		await shell.services.switchTimetable.invoke(id);
	}

	async function confirmDelete() {
		if (!pendingDeleteId) return;
		await shell.services.deleteTimetable.invoke(pendingDeleteId);
		pendingDeleteId = null;
		deleteDialogOpen = false;
	}

	function openDeleteDialog(id: string) {
		pendingDeleteId = id;
		deleteDialogOpen = true;
	}
</script>

<div class="m3-stack">
	<div class="flex flex-col gap-3">
		{#each appState.timetables as timetable (timetable.id)}
			{@const isActive = appState.currentTimetableId === timetable.id}
			<button
				type="button"
				class="flex w-full cursor-pointer items-center justify-between rounded-[28px] border p-[18px_16px] text-left transition-colors {isActive
					? 'border-brand bg-primary-container/40 dark:border-soft-blue'
					: 'border-outline-variant bg-surface hover:bg-surface-variant/40'}"
				onclick={() => handleSwitch(timetable.id)}
			>
				<div class="flex flex-1 flex-col gap-1">
					<span class="font-medium text-on-surface">{timetable.name}</span>
					<span class="text-xs text-on-surface-variant">{timetable.courseCount} 门课程</span>
				</div>
				{#if isActive}
					<CheckCircleFill class="size-6 flex-shrink-0 text-brand dark:text-soft-blue" />
				{:else}
					<Button
						variant="text"
						size="s"
						iconType="full"
						square
						aria-label="删除课表"
						onclick={(event) => {
							event.stopPropagation();
							openDeleteDialog(timetable.id);
						}}
					>
						<Delete class="text-danger" />
					</Button>
				{/if}
			</button>
		{/each}
	</div>

	{#if creating}
		<div
			class="create-panel flex flex-col gap-3 rounded-[28px] border border-outline-variant bg-surface p-4"
		>
			<TextFieldOutlined label="课表名称" bind:value={newName} placeholder="例如：2026 春季" />
			<div class="m3-actions-inline justify-end">
				<Button
					variant="text"
					onclick={() => {
						creating = false;
						newName = '';
					}}
				>
					取消
				</Button>
				<Button disabled={!newName.trim()} onclick={handleCreate}>保存</Button>
			</div>
		</div>
	{:else}
		<Button variant="outlined" iconType="left" onclick={() => (creating = true)}>
			<Add />
			新建课表
		</Button>
	{/if}

	<Button variant="text" onclick={onBack}>返回我的</Button>
</div>

<Dialog bind:open={deleteDialogOpen} headline="删除课表？">
	<p class="m3-body-medium text-on-surface-variant">删除后无法恢复。</p>
	{#snippet buttons()}
		<Button variant="text" onclick={() => (deleteDialogOpen = false)}>取消</Button>
		<Button variant="filled" onclick={confirmDelete}>删除</Button>
	{/snippet}
</Dialog>
