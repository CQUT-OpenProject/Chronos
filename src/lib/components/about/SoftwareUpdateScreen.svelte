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

	onMount(() => {
		void updateState.checkUpdate();
	});

	const htmlBody = $derived(
		updateState.state.latestRelease?.body ? parseMarkdown(updateState.state.latestRelease.body) : ''
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
	<AppHero
		title={updateState.state.hasUpdate
			? '发现新版本'
			: updateState.state.checking
				? '检查更新中'
				: '软件更新'}
		subtitle={updateState.state.hasUpdate
			? '建议及时更新以获取最新特性与体验优化'
			: `当前版本 v${APP_VERSION}`}
	/>

	{#if updateState.state.checking}
		<Card
			variant="filled"
			class="flex flex-col items-center justify-center gap-3 py-10 text-center"
		>
			<LoadingIndicator />
			<p class="m3-body-medium text-on-surface-variant">正在检查最新版本…</p>
		</Card>
	{:else if updateState.state.hasUpdate && updateState.state.latestRelease}
		<div class="flex flex-col gap-4">
			<HighlightRowList>
				<HighlightRow
					icon={Update}
					iconTone="primary"
					title="最新版本"
					subtitle={updateState.state.latestRelease.name || updateState.state.latestRelease.tagName}
				/>
				<HighlightRow
					icon={CalendarMonthFill}
					iconTone="secondary"
					title="发布日期"
					subtitle={formatPublishedDate(updateState.state.latestRelease.publishedAt)}
				/>
				<HighlightRow
					icon={InfoFill}
					iconTone="neutral"
					title="当前版本"
					subtitle={`v${updateState.state.currentVersion}`}
				/>
			</HighlightRowList>

			{#if htmlBody}
				<MineSection title="更新内容">
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
					{#snippet leading()}
						<DownloadFill class="size-5" />
					{/snippet}
					{updateState.state.updating ? '正在更新…' : '立即安装更新'}
				</Button>
			</div>
		</div>
	{:else if updateState.state.errorMessage}
		<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
			<InfoFill class="h-8 w-8 text-on-surface-variant" />
			<p class="m3-body-medium text-danger">{updateState.state.errorMessage}</p>
			<Button variant="filled" onclick={() => void updateState.checkUpdate()} class="mt-2">
				{#snippet leading()}
					<Refresh class="size-4" />
				{/snippet}
				重试
			</Button>
		</Card>
	{:else}
		<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
			<CheckCircleFill class="h-10 w-10 text-primary" />
			<div>
				<h3 class="m3-title-medium text-on-surface">当前已是最新版本</h3>
				<p class="m3-body-small mt-1 text-on-surface-variant">
					Chronos v{APP_VERSION} · 上次检查于 {formatCheckTime(updateState.state.lastChecked)}
				</p>
			</div>
			<Button variant="outlined" onclick={() => void updateState.checkUpdate()} class="mt-2">
				{#snippet leading()}
					<Refresh class="size-4" />
				{/snippet}
				重新检查
			</Button>
		</Card>
	{/if}

	<MineSection title="更多信息">
		<MineRow title="更新历史" href={resolve('/about/releases')} icon={History} iconTone="primary" />
		<MineRow
			title="源代码仓库"
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
