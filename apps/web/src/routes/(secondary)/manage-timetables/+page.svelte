<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import ManageTimetablesScreen from '$lib/components/mine/ManageTimetablesScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const shell = getContext<AppShellController>('appShell');
	const controller = getAppController();
</script>

<SecondaryPageShell
	title={hostTextRead(controller, 'route.manageTimetables')}
	backHref="/mine"
	flush
>
	<ManageTimetablesScreen {shell} />
</SecondaryPageShell>
