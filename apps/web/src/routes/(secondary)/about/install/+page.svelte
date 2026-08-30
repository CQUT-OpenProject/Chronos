<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import InstallScreen from '$lib/components/about/InstallScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostT('route.install')} backShellTab="mine">
	<InstallScreen />
</SecondaryPageShell>
