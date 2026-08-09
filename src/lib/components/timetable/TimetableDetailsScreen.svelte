<script lang="ts">
	import type { TimetableDetailsController } from '$lib/timetable/timetable-details.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import TimetableDetailsEditor from '$lib/components/timetable/TimetableDetailsEditor.svelte';

	let {
		editor
	}: {
		editor: TimetableDetailsController;
	} = $props();
</script>

{#if editor.draft}
	{#snippet resetFooter()}
		<Button variant="outlined" class="w-full" onclick={editor.resetToDefaultSettings}>
			恢复所有设置
		</Button>
	{/snippet}

	<FormScreenLayout footer={resetFooter}>
		<TimetableDetailsEditor {editor} />
	</FormScreenLayout>
{:else}
	<p class="p-4 text-sm text-on-surface-variant">未找到当前课表</p>
{/if}
