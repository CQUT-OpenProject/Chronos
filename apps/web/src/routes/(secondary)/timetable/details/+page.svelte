<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TimetableDetailsScreen from '$lib/components/timetable/TimetableDetailsScreen.svelte';
	import { createTimetableDetailsEditor } from '$lib/timetable/timetable-details.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const shell = getContext<AppShellController>('appShell');
	const controller = getAppController();
	const timetable = $derived(shell.controller.currentTimetable);

	const editor = createTimetableDetailsEditor(shell, () => goto(resolve('/')));

	$effect(() => {
		editor.loadFromTimetable(timetable);
	});
</script>

<SecondaryPageShell title={hostT('route.timetableEdit')} backHref="/" flush>
	<TimetableDetailsScreen {editor} />
</SecondaryPageShell>
