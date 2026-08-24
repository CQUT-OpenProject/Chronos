<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { trackEvent } from '$lib/client/analytics';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

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
	title={hostTextRead(controller, 'pwa.dialog.installed.title')}
	description={hostTextRead(controller, 'pwa.dialog.installed.desc')}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => pwaInstallController.dismiss()}>
			{hostTextRead(controller, 'pwa.dialog.installed.continueBrowser')}
		</Button>
		<Button variant="filled" onclick={() => pwaInstallController.openInApp()}>
			{hostTextRead(controller, 'pwa.dialog.installed.openApp')}
		</Button>
	{/snippet}
</Dialog>

<!-- Android / Desktop Install Dialog -->
<Dialog
	bind:open={pwaInstallController.installDialogOpen}
	title={hostTextRead(controller, 'pwa.dialog.install.title')}
	description={hostTextRead(controller, 'pwa.dialog.install.desc')}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => pwaInstallController.snoozeInstallPrompt()}>
			{hostTextRead(controller, 'pwa.dialog.install.later')}
		</Button>
		<Button variant="filled" onclick={goToInstallPage}>
			{hostTextRead(controller, 'pwa.dialog.install.action')}
		</Button>
	{/snippet}
</Dialog>

<!-- iOS Safari Guide Dialog -->
<Dialog
	bind:open={pwaInstallController.iosGuideOpen}
	title={hostTextRead(controller, 'pwa.dialog.install.title')}
>
	<div class="m3-body-medium flex flex-col gap-3 text-left leading-relaxed text-on-surface-variant">
		<p>{hostTextRead(controller, 'pwa.dialog.install.descIos')}</p>
		<ol class="flex flex-col gap-2 pt-1">
			<li class="flex items-start gap-2">
				<span class="m3-step-badge">1</span>
				<span class="m3-body-medium">
					{hostTextRead(controller, 'pwa.dialog.ios.step1')}
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="m3-step-badge">2</span>
				<span class="m3-body-medium">
					{hostTextRead(controller, 'pwa.dialog.ios.step2')}
				</span>
			</li>
		</ol>
	</div>
	{#snippet footer()}
		<Button variant="filled" onclick={goToInstallPage}>
			{hostTextRead(controller, 'pwa.dialog.ios.guide')}
		</Button>
	{/snippet}
</Dialog>
