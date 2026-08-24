<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import VersionReleaseScreen from '$lib/components/about/VersionReleaseScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';

	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostT('route.releaseDetail')} backHref="/about/releases">
	<VersionReleaseScreen tag={params.tag} />
</SecondaryPageShell>
