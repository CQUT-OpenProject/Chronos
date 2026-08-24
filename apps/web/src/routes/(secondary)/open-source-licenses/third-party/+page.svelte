<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import ThirdPartyLicensesScreen from '$lib/components/about/ThirdPartyLicensesScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

<SecondaryPageShell
	title={hostTextRead(controller, 'route.licenseThirdParty')}
	backHref="/open-source-licenses"
>
	<ThirdPartyLicensesScreen />
</SecondaryPageShell>
