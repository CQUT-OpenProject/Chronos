<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import DeveloperScreen from '$lib/components/about/DeveloperScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostTextRead(controller, 'route.developer')} backHref="/about">
	<DeveloperScreen />
</SecondaryPageShell>
