<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TimetableDetailsScreen from '$lib/components/timetable/TimetableDetailsScreen.svelte';
	import { createTimetableDetailsEditor } from '$lib/timetable/timetable-details.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const shell = getContext<AppShellController>('appShell');
	const controller = getAppController();
	const timetable = $derived(shell.controller.currentTimetable);

	const editor = createTimetableDetailsEditor(shell, () => goto(resolve('/')));

	$effect(() => {
		editor.loadFromTimetable(timetable);
	});
</script>

<SecondaryPageShell title={hostTextRead(controller, 'route.timetableEdit')} backHref="/" flush>
	<TimetableDetailsScreen {editor} />
</SecondaryPageShell>
