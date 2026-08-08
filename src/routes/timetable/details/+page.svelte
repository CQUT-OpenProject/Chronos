<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TimetableDetailsScreen from '$lib/components/timetable/TimetableDetailsScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
</script>

<SecondaryPageShell title="编辑课表" backHref="/">
	<TimetableDetailsScreen {shell} onDone={() => goto(resolve('/'))} />
</SecondaryPageShell>
