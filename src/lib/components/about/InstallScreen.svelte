<script lang="ts">
	import { onMount } from 'svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import { FullscreenFill, RocketLaunchFill, WifiOffFill } from '$lib/icons';
	import AppHero from '$lib/components/AppHero.svelte';
	import HighlightRow from '$lib/components/ui/HighlightRow.svelte';
	import HighlightRowList from '$lib/components/ui/HighlightRowList.svelte';
	import InstallGuideCard from '$lib/components/pwa/InstallGuideCard.svelte';

	onMount(() => {
		void pwaInstallController.init();
	});
</script>

<div class="mx-auto flex max-w-lg flex-col gap-6 py-2">
	<AppHero title="Chronos" subtitle="无广告 · 轻量化的课表体验" />

	<HighlightRowList>
		<HighlightRow
			icon={RocketLaunchFill}
			title="一键直达课表"
			subtitle="无需输入网址，直接在桌面或 Dock 栏快捷启动"
		/>
		<HighlightRow
			icon={WifiOffFill}
			title="完全离线可用"
			subtitle="自动本地缓存，断网无网状态下仍可查课表"
		/>
		<HighlightRow
			icon={FullscreenFill}
			title="沉浸全屏窗口"
			subtitle="无浏览器地址栏与边框，体验媲美原生 App"
		/>
	</HighlightRowList>

	<InstallGuideCard />
</div>
