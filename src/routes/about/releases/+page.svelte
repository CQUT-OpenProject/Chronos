<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import ReleaseListScreen from '$lib/components/about/ReleaseListScreen.svelte';
</script>

<SecondaryPageShell title="更新历史" backHref="/about">
	<ReleaseListScreen />
</SecondaryPageShell>
