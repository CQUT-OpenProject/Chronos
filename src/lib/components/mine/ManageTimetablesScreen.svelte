<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { AddFill, CheckCircleFill, DeleteFill } from '$lib/icons';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';

	let {
		shell
	}: {
		shell: AppShellController;
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

<div class="flex flex-col gap-5">
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
					<span
						role="button"
						tabindex="0"
						aria-label="删除课表"
						onclick={(event) => {
							event.stopPropagation();
							openDeleteDialog(timetable.id);
						}}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								event.stopPropagation();
								openDeleteDialog(timetable.id);
							}
						}}
						class="flex size-10 cursor-pointer items-center justify-center rounded-full text-danger transition-colors hover:bg-surface-variant/50 focus-visible:ring-2 focus-visible:ring-brand"
					>
						<DeleteFill class="size-5" />
					</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if creating}
		<div class="flex flex-col gap-3 rounded-[28px] border border-outline-variant bg-surface p-4">
			<div class="flex flex-col gap-1">
				<label for="new-timetable-name" class="text-xs font-medium text-on-surface-variant"
					>课表名称</label
				>
				<input
					id="new-timetable-name"
					type="text"
					bind:value={newName}
					placeholder="例如：2026 春季"
					class="w-full rounded-lg border border-outline bg-surface px-3.5 py-2 text-sm text-on-surface outline-none focus:border-brand"
				/>
			</div>
			<div class="flex items-center justify-end gap-2 pt-1">
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
		<div class="flex w-full pt-2">
			<Button variant="filled" class="w-full" onclick={() => (creating = true)}>
				<AddFill class="size-5" />
				新建课表
			</Button>
		</div>
	{/if}
</div>

<Dialog bind:open={deleteDialogOpen} title="删除课表？" description="删除后无法恢复。">
	{#snippet footer()}
		<Button variant="text" onclick={() => (deleteDialogOpen = false)}>取消</Button>
		<Button variant="filled" onclick={confirmDelete}>删除</Button>
	{/snippet}
</Dialog>
