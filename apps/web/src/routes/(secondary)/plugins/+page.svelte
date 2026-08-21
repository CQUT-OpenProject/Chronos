<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import PluginsScreen from '$lib/components/plugins/PluginsScreen.svelte';
</script>

<SecondaryPageShell title="插件中心" backHref="/mine" flush>
	<PluginsScreen />
</SecondaryPageShell>
