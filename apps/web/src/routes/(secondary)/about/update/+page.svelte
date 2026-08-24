<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import SoftwareUpdateScreen from '$lib/components/about/SoftwareUpdateScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostTextRead(controller, 'route.update')} backHref="/about">
	<SoftwareUpdateScreen />
</SecondaryPageShell>
