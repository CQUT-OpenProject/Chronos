<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import ManageTimetablesScreen from '$lib/components/mine/ManageTimetablesScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
</script>

<SecondaryPageShell title="管理课表" backHref="/mine">
	<ManageTimetablesScreen {shell} onBack={() => goto(resolve('/mine'))} />
</SecondaryPageShell>
