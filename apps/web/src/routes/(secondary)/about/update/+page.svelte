<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import SoftwareUpdateScreen from '$lib/components/about/SoftwareUpdateScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostT('route.update')} backHref="/about">
	<SoftwareUpdateScreen />
</SecondaryPageShell>
