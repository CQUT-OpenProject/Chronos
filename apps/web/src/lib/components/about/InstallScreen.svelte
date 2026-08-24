<script lang="ts">
	import { FullscreenFill, RocketLaunchFill, WifiOffFill } from '$lib/icons';
	import AppHero from '$lib/components/AppHero.svelte';
	import HighlightRow from '$lib/components/ui/HighlightRow.svelte';
	import HighlightRowList from '$lib/components/ui/HighlightRowList.svelte';
	import InstallGuideCard from '$lib/components/pwa/InstallGuideCard.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

<div class="mx-auto flex max-w-lg flex-col gap-6 py-2">
	<AppHero title="Chronos" subtitle={hostTextRead(controller, 'pwa.install.hero.subtitle')} />

	<HighlightRowList>
		<HighlightRow
			icon={RocketLaunchFill}
			title={hostTextRead(controller, 'pwa.install.feature.launch.title')}
			subtitle={hostTextRead(controller, 'pwa.install.feature.launch.subtitle')}
		/>
		<HighlightRow
			icon={WifiOffFill}
			title={hostTextRead(controller, 'pwa.install.feature.offline.title')}
			subtitle={hostTextRead(controller, 'pwa.install.feature.offline.subtitle')}
		/>
		<HighlightRow
			icon={FullscreenFill}
			title={hostTextRead(controller, 'pwa.install.feature.fullscreen.title')}
			subtitle={hostTextRead(controller, 'pwa.install.feature.fullscreen.subtitle')}
		/>
	</HighlightRowList>

	<InstallGuideCard />
</div>
