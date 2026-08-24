<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import { dismissSnackbar, snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import { estimateAppDataBytes, formatAppDataSize } from '$lib/storage/clear-app-data';
	import {
		APP_VERSION,
		BUILD_TIME,
		COPYRIGHT_HOLDER,
		formatCopyrightYearRange,
		PROJECT_LICENSE,
		SOURCE_CODE_URL
	} from '$lib/config/app-meta';
	import { hostTextRead } from '$lib/i18n/host-text';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import AppHero from '$lib/components/AppHero.svelte';
	import {
		CodeFill,
		GavelFill,
		InfoFill,
		LayersClearFill,
		OpenInNewFill,
		ArticleFill,
		ScheduleFill,
		ShieldFill
	} from '$lib/icons';

	let { shell }: { shell: AppShellController } = $props();

	let clickCount = $state(0);
	let clearDialogOpen = $state(false);
	let clearing = $state(false);
	let dataUsageBytes = $state<number | null>(null);

	const dataUsageSupporting = $derived(
		dataUsageBytes === null
			? hostTextRead(shell.controller, 'about.storage.calculating')
			: hostTextRead(shell.controller, 'about.storage.usage', {
					size: formatAppDataSize(dataUsageBytes)
				})
	);

	async function refreshDataUsage() {
		dataUsageBytes = await estimateAppDataBytes();
	}

	onMount(() => {
		void refreshDataUsage();
	});

	function formatBuildTime(value: string) {
		if (!value) return '-';
		return value.replace('T', ' ').replace(/\.\d+Z$/, 'Z');
	}

	function handleBuildTimeClick() {
		clickCount += 1;
		if (clickCount >= 10) {
			clickCount = 0;
			trackEvent('developer_easter_egg_open');
			dismissSnackbar();
			void goto(resolve('/about/easter-egg'));
		} else if (clickCount >= 5) {
			const remaining = 10 - clickCount;
			snackbarKey('about.easterEgg.hint', { remaining }, undefined, 1500);
		}
	}

	async function confirmClear() {
		trackEvent('about_clear_all_data');
		clearing = true;
		try {
			await shell.clearAllData();
			clearDialogOpen = false;
			await refreshDataUsage();
			snackbarKey('about.clear.success');
		} catch {
			snackbarKey('about.clear.failed');
		} finally {
			clearing = false;
		}
	}
</script>

<div class="m3-stack">
	<AppHero title="Chronos" subtitle={hostTextRead(shell.controller, 'meta.intro')} />

	<MineSection title={hostTextRead(shell.controller, 'about.section.version')}>
		<MineRow
			title={hostTextRead(shell.controller, 'about.version.current')}
			supporting={APP_VERSION}
			href={resolve('/about/update')}
			icon={InfoFill}
			iconTone="primary"
		/>
		<MineRow
			title={hostTextRead(shell.controller, 'about.buildTime')}
			supporting={formatBuildTime(BUILD_TIME)}
			icon={ScheduleFill}
			iconTone="secondary"
			onclick={handleBuildTimeClick}
		/>
	</MineSection>

	<MineSection title={hostTextRead(shell.controller, 'about.section.storage')}>
		<MineRow
			title={hostTextRead(shell.controller, 'about.storage.clear')}
			supporting={dataUsageSupporting}
			icon={LayersClearFill}
			iconTone="neutral"
			onclick={() => (clearDialogOpen = true)}
		/>
	</MineSection>

	<MineSection title={hostTextRead(shell.controller, 'about.section.info')}>
		<MineRow
			title={hostTextRead(shell.controller, 'about.legal.terms')}
			href={resolve('/legal/terms')}
			icon={ArticleFill}
			iconTone="tertiary"
		/>
		<MineRow
			title={hostTextRead(shell.controller, 'about.legal.privacy')}
			href={resolve('/legal/privacy')}
			icon={ShieldFill}
			iconTone="tertiary"
		/>
		<MineRow
			title={hostTextRead(shell.controller, 'about.legal.licenses')}
			href={resolve('/open-source-licenses')}
			icon={GavelFill}
			iconTone="tertiary"
		/>
		<MineRow
			title={hostTextRead(shell.controller, 'about.source')}
			href={SOURCE_CODE_URL}
			target="_blank"
			rel="noreferrer"
			icon={CodeFill}
			iconTone="neutral"
		>
			{#snippet trailing()}
				<OpenInNewFill class="text-on-surface-variant" style="width:1.125rem;height:1.125rem" />
			{/snippet}
		</MineRow>
	</MineSection>

	<footer class="copyright">
		<p class="m3-body-small text-on-surface-variant">
			© {formatCopyrightYearRange()}
			{COPYRIGHT_HOLDER} ·
			<a href={resolve('/open-source-licenses/project')} class="license-link">
				{PROJECT_LICENSE}
			</a>
		</p>
	</footer>
</div>

<Dialog
	bind:open={clearDialogOpen}
	title={hostTextRead(shell.controller, 'about.clear.title')}
	description={hostTextRead(shell.controller, 'about.clear.desc')}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => (clearDialogOpen = false)} disabled={clearing}>
			{hostTextRead(shell.controller, 'common.cancel')}
		</Button>
		<Button variant="danger" disabled={clearing} onclick={confirmClear}>
			{hostTextRead(shell.controller, 'common.clear')}
		</Button>
	{/snippet}
</Dialog>

<style>
	.copyright {
		padding-top: 1.5rem;
		text-align: center;
	}

	.license-link {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.125rem;
	}

	.license-link:hover {
		opacity: 0.8;
	}
</style>
