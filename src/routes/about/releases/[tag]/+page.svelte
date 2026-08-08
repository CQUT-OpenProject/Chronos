<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import VersionReleaseScreen from '$lib/components/about/VersionReleaseScreen.svelte';

	let { data }: { data: { tag: string } } = $props();
</script>

<SecondaryPageShell title="发布信息" backHref="/about/releases">
	<VersionReleaseScreen tag={data.tag} />
</SecondaryPageShell>
