<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import AboutScreen from '$lib/components/about/AboutScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const shell = getContext<AppShellController>('appShell');
	const controller = getAppController();
</script>

<SecondaryPageShell title={hostT('route.about')} backHref="/mine">
	<AboutScreen {shell} />
</SecondaryPageShell>
