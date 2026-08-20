<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import VersionReleaseScreen from '$lib/components/about/VersionReleaseScreen.svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();
</script>

<SecondaryPageShell title="发布信息" backHref="/about/releases">
	<VersionReleaseScreen tag={params.tag} />
</SecondaryPageShell>
