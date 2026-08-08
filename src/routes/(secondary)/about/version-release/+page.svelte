<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import VersionReleaseScreen from '$lib/components/about/VersionReleaseScreen.svelte';
	import { APP_VERSION } from '$lib/config/app-meta';
</script>

<SecondaryPageShell title="发布信息" backHref="/about">
	<VersionReleaseScreen tag={APP_VERSION} />
</SecondaryPageShell>
