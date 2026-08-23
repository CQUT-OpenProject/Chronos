<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import AboutScreen from '$lib/components/about/AboutScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
</script>

<SecondaryPageShell title="关于 Chronos" backHref="/mine">
	<AboutScreen {shell} />
</SecondaryPageShell>
