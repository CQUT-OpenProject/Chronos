<script lang="ts">
	import type { TimetableDetailsController } from '$lib/timetable/timetable-details.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import TimetableDetailsEditor from '$lib/components/timetable/TimetableDetailsEditor.svelte';

	let {
		editor
	}: {
		editor: TimetableDetailsController;
	} = $props();

	let resetDialogOpen = $state(false);

	function confirmReset() {
		editor.resetToDefaultSettings();
		resetDialogOpen = false;
	}
</script>

{#if editor.draft}
	{#snippet footer()}
		<div class="flex w-full gap-3">
			<Button variant="outlined" class="w-full flex-1" onclick={() => (resetDialogOpen = true)}>
				恢复默认设置
			</Button>
			<Button
				variant="filled"
				class="w-full flex-1"
				disabled={!editor.canSave}
				onclick={editor.save}
			>
				保存
			</Button>
		</div>
	{/snippet}

	<FormScreenLayout {footer}>
		<TimetableDetailsEditor {editor} />
	</FormScreenLayout>

	<Dialog bind:open={resetDialogOpen} title="恢复默认设置？" description="确定要恢复为默认设置吗？">
		{#snippet footer()}
			<Button variant="text" onclick={() => (resetDialogOpen = false)}>取消</Button>
			<Button variant="filled" onclick={confirmReset}>确定</Button>
		{/snippet}
	</Dialog>
{:else}
	<p class="p-4 text-sm text-on-surface-variant">未找到当前课表</p>
{/if}
