<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import VersionReleaseScreen from '$lib/components/about/VersionReleaseScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	const controller = getAppController();
</script>

<SecondaryPageShell
	title={hostTextRead(controller, 'route.releaseDetail')}
	backHref="/about/releases"
>
	<VersionReleaseScreen tag={params.tag} />
</SecondaryPageShell>
