<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import ReleaseListScreen from '$lib/components/about/ReleaseListScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostTextRead(controller, 'route.releases')} backHref="/about/update">
	<ReleaseListScreen />
</SecondaryPageShell>
