<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { FullscreenFill, RocketLaunchFill, WifiOffFill } from '$lib/icons';
	import AppHero from '$lib/components/AppHero.svelte';
	import HighlightRow from '$lib/components/ui/HighlightRow.svelte';
	import HighlightRowList from '$lib/components/ui/HighlightRowList.svelte';
	import InstallGuideCard from '$lib/components/pwa/InstallGuideCard.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const controller = getAppController();
</script>

<div class="mx-auto flex max-w-lg flex-col gap-6 py-2">
	<AppHero title="Chronos" subtitle={hostT('pwa.install.hero.subtitle')} />

	<HighlightRowList>
		<HighlightRow
			icon={RocketLaunchFill}
			title={hostT('pwa.install.feature.launch.title')}
			subtitle={hostT('pwa.install.feature.launch.subtitle')}
		/>
		<HighlightRow
			icon={WifiOffFill}
			title={hostT('pwa.install.feature.offline.title')}
			subtitle={hostT('pwa.install.feature.offline.subtitle')}
		/>
		<HighlightRow
			icon={FullscreenFill}
			title={hostT('pwa.install.feature.fullscreen.title')}
			subtitle={hostT('pwa.install.feature.fullscreen.subtitle')}
		/>
	</HighlightRowList>

	<InstallGuideCard />
</div>
