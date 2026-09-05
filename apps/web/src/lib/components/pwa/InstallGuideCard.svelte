<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import { getAppController } from '$lib/services/app-engine';

	import { CheckCircleFill, IosShareFill, RocketLaunchFill } from '$lib/icons';

	let { inOnboarding = false }: { inOnboarding?: boolean } = $props();

	const controller = getAppController();

	async function handleInstallAction() {
		// Note: this handler only runs from the generic Chromium branch below
		// (standalone / installed / macSafari / iOS render their own cards),
		// but the guards stay for robustness if the branch structure changes.
		if (pwaInstallController.isStandalone) {
			snackbarKey('pwa.snackbar.alreadyInstalled');
			return;
		}

		if (pwaInstallController.isInstalledLocally) {
			pwaInstallController.openInApp();
			return;
		}

		if (pwaInstallController.canPrompt) {
			const installed = await pwaInstallController.install();
			if (!installed) snackbarKey('pwa.snackbar.manualInstall');
			return;
		}

		snackbarKey('pwa.snackbar.unsupportedInstall');
	}
</script>

{#if pwaInstallController.isStandalone}
	<Card variant="filled" class="text-center">
		<p class="text-title-small flex items-center justify-center gap-2 text-brand">
			<CheckCircleFill class="h-5 w-5" />
			<span>{hostT('pwa.guide.installed.title')}</span>
		</p>
		<p class="text-body-small text-on-surface-variant">
			{#if inOnboarding}
				{hostT('pwa.guide.installed.onboarding')}
			{:else}
				{hostT('pwa.guide.installed.full')}
			{/if}
		</p>
	</Card>
{:else if pwaInstallController.isInstalledLocally && inOnboarding}
	<Card variant="filled" class="text-center">
		<p class="text-title-small flex items-center justify-center gap-2 text-brand">
			<CheckCircleFill class="h-5 w-5" />
			<span>{hostT('pwa.guide.local.title')}</span>
		</p>
		<p class="text-body-small text-on-surface-variant">
			{hostT('pwa.guide.local.onboarding')}
		</p>
	</Card>
{:else if pwaInstallController.isInstalledLocally}
	<Card variant="outlined">
		<div class="flex flex-col gap-4">
			<p class="text-title-small flex items-center justify-center gap-2 text-brand">
				<CheckCircleFill class="h-5 w-5" />
				<span>{hostT('pwa.guide.installed.title')}</span>
			</p>
			<p class="text-body-small text-center text-on-surface-variant">
				{hostT('pwa.guide.local.hint')}
			</p>
			<Button variant="filled" class="w-full" onclick={() => pwaInstallController.openInApp()}>
				<RocketLaunchFill class="size-5" />
				<span>{hostT('pwa.guide.openApp')}</span>
			</Button>
		</div>
	</Card>
{:else if pwaInstallController.isMacSafari}
	<Card variant="outlined">
		<h3 class="text-title-small mb-3 text-on-surface">
			{hostT('pwa.guide.mac.title')}
		</h3>
		<ol class="flex flex-col gap-3 text-on-surface-variant">
			<li class="flex items-start gap-2.5">
				<span class="ui-step-badge">1</span>
				<span class="text-body-small">{hostT('pwa.guide.mac.step1')}</span>
			</li>
			<li class="flex items-start gap-2.5">
				<span class="ui-step-badge">2</span>
				<span class="text-body-small">{hostT('pwa.guide.mac.step2')}</span>
			</li>
			<li class="flex items-start gap-2.5">
				<span class="ui-step-badge">3</span>
				<span class="text-body-small">{hostT('pwa.guide.mac.step3')}</span>
			</li>
		</ol>
	</Card>
{:else if pwaInstallController.isIOS}
	<Card variant="outlined">
		<h3 class="text-title-small mb-3 text-on-surface">
			{hostT('pwa.guide.ios.title')}
		</h3>
		<ol class="flex flex-col gap-3 text-on-surface-variant">
			<li class="flex items-start gap-2.5">
				<span class="ui-step-badge">1</span>
				<span class="text-body-small">
					{hostT('pwa.guide.ios.step1')}
					<IosShareFill class="inline h-3.5 w-3.5 text-brand" />
				</span>
			</li>
			<li class="flex items-start gap-2.5">
				<span class="ui-step-badge">2</span>
				<span class="text-body-small">{hostT('pwa.guide.ios.step2')}</span>
			</li>
			<li class="flex items-start gap-2.5">
				<span class="ui-step-badge">3</span>
				<span class="text-body-small">{hostT('pwa.guide.ios.step3')}</span>
			</li>
		</ol>
	</Card>
{:else}
	<Card variant="outlined">
		<div class="flex flex-col gap-4">
			<Button variant="filled" class="w-full" onclick={handleInstallAction}>
				<span>{hostT('pwa.guide.chrome.install')}</span>
			</Button>

			<div class="rounded-xl bg-surface-container-high/60 p-3.5 text-on-surface-variant">
				<p class="text-body-large text-on-surface">
					{hostT('pwa.guide.chrome.hint.title')}
				</p>
				<p class="text-body-small">
					{hostT('pwa.guide.chrome.hint.body')}
				</p>
			</div>
		</div>
	</Card>
{/if}
