<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import ThirdPartyLicensesScreen from '$lib/components/about/ThirdPartyLicensesScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostT('route.licenseThirdParty')} backHref="/open-source-licenses">
	<ThirdPartyLicensesScreen />
</SecondaryPageShell>
