<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import DisplaySettingsScreen from '$lib/components/mine/DisplaySettingsScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
</script>

<SecondaryPageShell title="显示设置" backHref="/mine">
	<DisplaySettingsScreen {shell} />
</SecondaryPageShell>
