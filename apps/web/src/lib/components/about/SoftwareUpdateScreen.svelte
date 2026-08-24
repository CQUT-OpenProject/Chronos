<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import {
		createUpdateState,
		type SoftwareUpdateStateController
	} from '$lib/content/releases/update-state.svelte';
	import { parseMarkdown } from '$lib/content/markdown';
	import { formatPublishedDate } from '$lib/content/releases/release-display';
	import { APP_VERSION, SOURCE_CODE_URL } from '$lib/config/app-meta';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';
	import AppHero from '$lib/components/AppHero.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import HighlightRow from '$lib/components/ui/HighlightRow.svelte';
	import HighlightRowList from '$lib/components/ui/HighlightRowList.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import {
		CalendarMonthFill,
		CheckCircleFill,
		CodeFill,
		DownloadFill,
		History,
		InfoFill,
		OpenInNewFill,
		Refresh,
		Update
	} from '$lib/icons';

	let {
		updateState = createUpdateState()
	}: {
		updateState?: SoftwareUpdateStateController;
	} = $props();

	const controller = getAppController();

	onMount(() => {
		void updateState.checkUpdate();
	});

	const htmlBody = $derived(
		updateState.state.latestRelease?.body ? parseMarkdown(updateState.state.latestRelease.body) : ''
	);

	const heroTitle = $derived(
		updateState.state.hasUpdate
			? hostTextRead(controller, 'about.update.title.new')
			: updateState.state.checking
				? hostTextRead(controller, 'about.update.title.checking')
				: hostTextRead(controller, 'about.update.title.default')
	);

	const heroSubtitle = $derived(
		updateState.state.hasUpdate
			? hostTextRead(controller, 'about.update.subtitle.new')
			: hostTextRead(controller, 'about.update.subtitle.current', { version: APP_VERSION })
	);

	function formatCheckTime(date: Date | null): string {
		if (!date) return '-';
		return date.toLocaleTimeString('zh-CN', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}
</script>

<div class="flex flex-col gap-6 py-2">
	<AppHero title={heroTitle} subtitle={heroSubtitle} />

	{#if updateState.state.checking}
		<Card
			variant="filled"
			class="flex flex-col items-center justify-center gap-3 py-10 text-center"
		>
			<LoadingIndicator />
			<p class="m3-body-medium text-on-surface-variant">
				{hostTextRead(controller, 'about.update.checking')}
			</p>
		</Card>
	{:else if updateState.state.hasUpdate}
		<div class="flex flex-col gap-4">
			<HighlightRowList>
				{#if updateState.state.latestRelease}
					<HighlightRow
						icon={Update}
						title={hostTextRead(controller, 'about.update.latest')}
						subtitle={updateState.state.latestRelease.name ||
							updateState.state.latestRelease.tagName}
					/>
					<HighlightRow
						icon={CalendarMonthFill}
						title={hostTextRead(controller, 'about.update.published')}
						subtitle={formatPublishedDate(updateState.state.latestRelease.publishedAt)}
					/>
				{/if}
				<HighlightRow
					icon={InfoFill}
					title={hostTextRead(controller, 'about.update.current')}
					subtitle={`v${updateState.state.currentVersion}`}
				/>
			</HighlightRowList>

			{#if htmlBody}
				<MineSection title={hostTextRead(controller, 'about.update.changelog')}>
					<div
						class="markdown-prose markdown-prose--release prose prose-sm max-w-none px-2 dark:prose-invert"
					>
						{@html htmlBody}
					</div>
				</MineSection>
			{/if}

			<div class="pt-2">
				<Button
					variant="filled"
					class="w-full"
					disabled={updateState.state.updating}
					onclick={() => void updateState.installUpdate()}
				>
					<DownloadFill class="size-5" />
					{updateState.state.updating
						? hostTextRead(controller, 'about.update.installing')
						: hostTextRead(controller, 'about.update.install')}
				</Button>
			</div>
		</div>
	{:else if updateState.state.errorMessage}
		<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
			<InfoFill class="h-8 w-8 text-on-surface-variant" />
			<p class="m3-body-medium text-danger">{updateState.state.errorMessage}</p>
			<Button variant="filled" onclick={() => void updateState.checkUpdate()} class="mt-2">
				<Refresh class="size-4" />
				{hostTextRead(controller, 'about.update.retry')}
			</Button>
		</Card>
	{:else}
		<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
			<CheckCircleFill class="h-10 w-10 text-primary" />
			<div>
				<h3 class="m3-title-medium text-on-surface">
					{hostTextRead(controller, 'about.update.upToDate.title')}
				</h3>
				<p class="m3-body-small mt-1 text-on-surface-variant">
					{hostTextRead(controller, 'about.update.upToDate.lastChecked', {
						time: formatCheckTime(updateState.state.lastChecked)
					})}
				</p>
			</div>
			<Button variant="outlined" onclick={() => void updateState.checkUpdate()} class="mt-2">
				<Refresh class="size-4" />
				{hostTextRead(controller, 'about.update.recheck')}
			</Button>
		</Card>
	{/if}

	<MineSection title={hostTextRead(controller, 'about.update.more.heading')}>
		<MineRow
			title={hostTextRead(controller, 'about.update.more.history')}
			href={resolve('/about/releases')}
			icon={History}
			iconTone="primary"
		/>
		<MineRow
			title={hostTextRead(controller, 'about.update.more.repo')}
			supporting="CQUT-OpenProject/Chronos"
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
</div>
