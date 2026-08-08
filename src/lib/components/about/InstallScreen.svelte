<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import {
		AddHomeFill,
		CheckCircleFill,
		FullscreenFill,
		IosShareFill,
		RocketLaunchFill,
		WifiOffFill
	} from '$lib/icons';
	import AppHero from '$lib/components/AppHero.svelte';
	import HighlightRow from '$lib/components/ui/HighlightRow.svelte';
	import HighlightRowList from '$lib/components/ui/HighlightRowList.svelte';

	onMount(() => {
		pwaInstallController.checkEnvironment();
	});

	async function handleInstallAction() {
		if (pwaInstallController.isStandalone) {
			snackbar('当前已成功安装为桌面应用');
			return;
		}

		if (pwaInstallController.canPrompt) {
			const success = await pwaInstallController.install();
			if (success) {
				snackbar('正在启动安装程序...');
			}
			return;
		}

		if (pwaInstallController.isIOS) {
			pwaInstallController.iosGuideOpen = true;
			return;
		}

		snackbar('请点击地址栏右侧的安装图标 ⊕ 或菜单中的“安装 Chronos”');
	}
</script>

<div class="mx-auto flex max-w-lg flex-col gap-6 py-2">
	<AppHero title="Chronos" subtitle="无缝的课表体验 · 随时随地" />

	<HighlightRowList>
		<HighlightRow
			icon={RocketLaunchFill}
			title="一键直达课表"
			subtitle="无需输入网址，直接在桌面或 Dock 栏快捷启动。"
		/>
		<HighlightRow
			icon={WifiOffFill}
			title="完全离线可用"
			subtitle="自动本地缓存，断网无网状态下仍可查课表。"
		/>
		<HighlightRow
			icon={FullscreenFill}
			title="沉浸全屏窗口"
			subtitle="移除浏览器地址栏与边框，体验媲美原生 App。"
		/>
	</HighlightRowList>

	<!-- Action / Guide Area -->
	{#if pwaInstallController.isStandalone}
		<Card variant="filled" class="text-center">
			<p class="m3-title-small text-primary flex items-center justify-center gap-2 font-bold">
				<CheckCircleFill class="h-5 w-5" />
				<span>已成功安装 Chronos</span>
			</p>
			<p class="m3-body-medium text-xs text-on-surface-variant">
				你目前正在独立应用模式下运行，享受完整 PWA 体验。
			</p>
		</Card>
	{:else if pwaInstallController.isMacSafari}
		<!-- macOS Safari Guidance Card -->
		<Card variant="outlined">
			<h3 class="m3-title-small mb-3 font-bold text-on-surface">macOS Safari 安装指引：</h3>
			<ol class="flex flex-col gap-3 text-on-surface-variant">
				<li class="flex items-start gap-2.5">
					<span
						class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						>1</span
					>
					<span class="m3-body-medium text-xs"
						>在屏幕顶部点击 Safari 菜单栏的 <strong>“文件” (File)</strong></span
					>
				</li>
				<li class="flex items-start gap-2.5">
					<span
						class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						>2</span
					>
					<span class="m3-body-medium text-xs"
						>选择 <strong>“添加到 Dock...” (Add to Dock...)</strong></span
					>
				</li>
				<li class="flex items-start gap-2.5">
					<span
						class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						>3</span
					>
					<span class="m3-body-medium text-xs"
						>点击 <strong>“添加”</strong> 确认即可从程序坞或启动台快捷打开</span
					>
				</li>
			</ol>
		</Card>
	{:else if pwaInstallController.isIOS}
		<!-- iOS / iPadOS Safari Guidance Card -->
		<Card variant="outlined">
			<h3 class="m3-title-small mb-3 font-bold text-on-surface">iOS / iPadOS 安装指引：</h3>
			<ol class="flex flex-col gap-3 text-on-surface-variant">
				<li class="flex items-start gap-2.5">
					<span
						class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						>1</span
					>
					<span class="m3-body-medium text-xs">
						点击 Safari 底部的 <strong>
							分享图标 <IosShareFill class="text-primary inline h-3.5 w-3.5" />
						</strong>
					</span>
				</li>
				<li class="flex items-start gap-2.5">
					<span
						class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						>2</span
					>
					<span class="m3-body-medium text-xs"
						>在列表中滑动选择 <strong>“添加到主屏幕”</strong></span
					>
				</li>
				<li class="flex items-start gap-2.5">
					<span
						class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						>3</span
					>
					<span class="m3-body-medium text-xs">点击右上角 <strong>“添加”</strong> 确认</span>
				</li>
			</ol>
		</Card>
	{:else}
		<!-- Chrome / Chromium Action Button & Clean Hint Card -->
		<Card variant="outlined">
			<div class="flex flex-col gap-4">
				<Button variant="filled" class="w-full" onclick={handleInstallAction}>
					<AddHomeFill class="size-5" />
					<span>安装 Chronos 到设备</span>
				</Button>

				<div class="rounded-xl bg-surface-container-high/60 p-3.5 text-on-surface-variant">
					<p class="m3-body-large font-normal text-on-surface">提示：</p>
					<p class="m3-body-medium text-xs">
						{#if pwaInstallController.canPrompt}
							点击按钮即可唤起系统原生 PWA 安装对话框。
						{:else}
							若点击按钮未弹出安装窗口，亦可点击 <strong class="text-on-surface"
								>地址栏右侧的安装图标 ⊕</strong
							>，或在菜单中选择 <strong class="text-on-surface">“安装 Chronos”</strong>。
						{/if}
					</p>
				</div>
			</div>
		</Card>
	{/if}
</div>
