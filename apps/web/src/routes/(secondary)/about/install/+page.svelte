<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import InstallScreen from '$lib/components/about/InstallScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostTextRead(controller, 'route.install')} backHref="/mine">
	<InstallScreen />
</SecondaryPageShell>
