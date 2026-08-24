<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { trackEvent } from '$lib/client/analytics';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const controller = getAppController();

	function goToInstallPage() {
		trackEvent('pwa_install_cta_click');
		pwaInstallController.dismiss({ track: false });
		void goto(resolve('/about/install'));
	}
</script>

<!-- Already installed: open in standalone app -->
<Dialog
	bind:open={pwaInstallController.openInAppDialogOpen}
	title={hostT('pwa.dialog.installed.title')}
	description={hostT('pwa.dialog.installed.desc')}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => pwaInstallController.dismiss()}>
			{hostT('pwa.dialog.installed.continueBrowser')}
		</Button>
		<Button variant="filled" onclick={() => pwaInstallController.openInApp()}>
			{hostT('pwa.dialog.installed.openApp')}
		</Button>
	{/snippet}
</Dialog>

<!-- Android / Desktop Install Dialog -->
<Dialog
	bind:open={pwaInstallController.installDialogOpen}
	title={hostT('pwa.dialog.install.title')}
	description={hostT('pwa.dialog.install.desc')}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => pwaInstallController.snoozeInstallPrompt()}>
			{hostT('pwa.dialog.install.later')}
		</Button>
		<Button variant="filled" onclick={goToInstallPage}>
			{hostT('pwa.dialog.install.action')}
		</Button>
	{/snippet}
</Dialog>

<!-- iOS Safari Guide Dialog -->
<Dialog bind:open={pwaInstallController.iosGuideOpen} title={hostT('pwa.dialog.install.title')}>
	<div class="m3-body-medium flex flex-col gap-3 text-left leading-relaxed text-on-surface-variant">
		<p>{hostT('pwa.dialog.install.descIos')}</p>
		<ol class="flex flex-col gap-2 pt-1">
			<li class="flex items-start gap-2">
				<span class="m3-step-badge">1</span>
				<span class="m3-body-medium">
					{hostT('pwa.dialog.ios.step1')}
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="m3-step-badge">2</span>
				<span class="m3-body-medium">
					{hostT('pwa.dialog.ios.step2')}
				</span>
			</li>
		</ol>
	</div>
	{#snippet footer()}
		<Button variant="filled" onclick={goToInstallPage}>
			{hostT('pwa.dialog.ios.guide')}
		</Button>
	{/snippet}
</Dialog>
