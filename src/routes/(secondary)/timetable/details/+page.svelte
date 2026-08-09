<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TimetableDetailsScreen from '$lib/components/timetable/TimetableDetailsScreen.svelte';
	import { createTimetableDetailsEditor } from '$lib/timetable/timetable-details.svelte';

	const shell = getContext<AppShellController>('appShell');

	const editor = createTimetableDetailsEditor(shell, () => goto(resolve('/')));
</script>

{#snippet saveAction()}
	{#if editor.draft}
		<Button variant="text" class="px-2" disabled={!editor.canSave} onclick={editor.save}>
			保存
		</Button>
	{/if}
{/snippet}

<SecondaryPageShell title="编辑课表" backHref="/" actions={saveAction} flush>
	<TimetableDetailsScreen {editor} />
</SecondaryPageShell>
