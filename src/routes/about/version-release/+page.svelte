<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import VersionReleaseScreen from '$lib/components/about/VersionReleaseScreen.svelte';
</script>

<SecondaryPageShell title="发布信息" backHref="/about">
	<VersionReleaseScreen />
</SecondaryPageShell>
