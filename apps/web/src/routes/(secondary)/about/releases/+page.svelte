<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import ReleaseListScreen from '$lib/components/about/ReleaseListScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostT('route.releases')} backHref="/about/update">
	<ReleaseListScreen />
</SecondaryPageShell>
