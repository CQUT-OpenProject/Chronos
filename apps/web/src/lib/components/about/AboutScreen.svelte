<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import { dismissSnackbar, snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import { estimateAppDataBytes, formatAppDataSize } from '$lib/storage/clear-app-data';
	import {
		APP_VERSION,
		BUILD_TIME,
		COPYRIGHT_HOLDER,
		formatCopyrightYearRange,
		PROJECT_INTRO,
		PROJECT_LICENSE,
		SOURCE_CODE_URL
	} from '$lib/config/app-meta';
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
		dataUsageBytes === null ? '正在计算占用…' : `当前占用 ${formatAppDataSize(dataUsageBytes)}`
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
			snackbar(`再按 ${remaining} 次进入开发者页面`, undefined, 1500);
		}
	}

	async function confirmClear() {
		trackEvent('about_clear_all_data');
		clearing = true;
		try {
			await shell.clearAllData();
			clearDialogOpen = false;
			await refreshDataUsage();
			snackbar('已清除所有数据');
		} catch {
			snackbar('清除失败，请重试');
		} finally {
			clearing = false;
		}
	}
</script>

<div class="m3-stack">
	<AppHero title="Chronos" subtitle={PROJECT_INTRO} />

	<MineSection title="版本信息">
		<MineRow
			title="当前版本"
			supporting={APP_VERSION}
			href={resolve('/about/update')}
			icon={InfoFill}
			iconTone="primary"
		/>
		<MineRow
			title="构建时间"
			supporting={formatBuildTime(BUILD_TIME)}
			icon={ScheduleFill}
			iconTone="secondary"
			onclick={handleBuildTimeClick}
		/>
	</MineSection>

	<MineSection title="存储占用情况">
		<MineRow
			title="清除所有数据"
			supporting={dataUsageSupporting}
			icon={LayersClearFill}
			iconTone="neutral"
			onclick={() => (clearDialogOpen = true)}
		/>
	</MineSection>

	<MineSection title="软件信息">
		<MineRow
			title="服务协议"
			href={resolve('/legal/terms')}
			icon={ArticleFill}
			iconTone="tertiary"
		/>
		<MineRow
			title="隐私政策"
			href={resolve('/legal/privacy')}
			icon={ShieldFill}
			iconTone="tertiary"
		/>
		<MineRow
			title="开源许可"
			href={resolve('/open-source-licenses')}
			icon={GavelFill}
			iconTone="tertiary"
		/>
		<MineRow
			title="源代码"
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
	title="清除所有数据？"
	description="将删除本设备上的所有课表、课程、壁纸、主题偏好与已保存的教务凭据。此操作不可恢复。"
>
	{#snippet footer()}
		<Button variant="text" onclick={() => (clearDialogOpen = false)} disabled={clearing}
			>取消</Button
		>
		<Button variant="danger" disabled={clearing} onclick={confirmClear}>清除</Button>
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
