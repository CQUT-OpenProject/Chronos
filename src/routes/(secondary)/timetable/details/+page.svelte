<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TimetableDetailsScreen from '$lib/components/timetable/TimetableDetailsScreen.svelte';
	import { createTimetableDetailsEditor } from '$lib/timetable/timetable-details.svelte';

	const shell = getContext<AppShellController>('appShell');
	const timetable = $derived(shell.state.appState.currentTimetable);

	const editor = createTimetableDetailsEditor(shell, () => goto(resolve('/')));

	$effect(() => {
		editor.loadFromTimetable(timetable);
	});
</script>

<SecondaryPageShell title="编辑课表" backHref="/" flush>
	<TimetableDetailsScreen {editor} />
</SecondaryPageShell>
