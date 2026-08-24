<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import PluginsScreen from '$lib/components/plugins/PluginsScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostTextRead(controller, 'route.plugins')} backHref="/mine" flush>
	<PluginsScreen />
</SecondaryPageShell>
