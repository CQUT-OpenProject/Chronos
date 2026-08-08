<script lang="ts">
	import { onMount } from 'svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import { Button, Card, snackbar } from 'm3-svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import {
		AddHomeFill,
		CheckCircleFill,
		FullscreenFill,
		IosShareFill,
		RocketLaunchFill,
		WifiOffFill
	} from '$lib/icons';
	import chronosIcon from '$lib/assets/chronos-icon.svg';

	onMount(() => {
		pwaInstallController.checkEnvironment();
	});

	async function handleInstallAction() {
		if (pwaInstallController.isStandalone) {
			snackbar('当前已成功安装为桌面应用', {}, true, 3000);
			return;
		}

		if (pwaInstallController.canPrompt) {
			const success = await pwaInstallController.install();
			if (success) {
				snackbar('正在启动安装程序...', {}, true, 3000);
			}
			return;
		}

		if (pwaInstallController.isIOS) {
			pwaInstallController.iosGuideOpen = true;
			return;
		}

		snackbar('请点击地址栏右侧的安装图标 ⊕ 或菜单中的“安装 Chronos”', {}, true, 5000);
	}
</script>

<SecondaryPageShell title="安装 Chronos" backHref="/mine">
	<div class="m3-stack mx-auto max-w-lg gap-6 py-2">
		<!-- Hero Section -->
		<div class="flex flex-col items-center gap-3 pt-2 text-center">
			<img
				src={chronosIcon}
				alt="Chronos Logo"
				class="h-20 w-20 rounded-2xl shadow-md ring-1 ring-black/5 dark:ring-white/10"
			/>
			<div>
				<h1 class="m3-headline-small font-bold text-on-surface">Chronos</h1>
				<p class="m3-body-medium text-on-surface-variant">无缝的课表体验 · 随时随地</p>
			</div>
		</div>

		<!-- Highlights Card -->
		<Card variant="outlined" class="!p-5">
			<h2 class="m3-title-small mb-4 font-bold text-on-surface">PWA 特性</h2>
			<ul class="flex flex-col gap-4 text-sm text-on-surface-variant">
				<li class="flex items-start gap-3.5">
					<div
						class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
					>
						<RocketLaunchFill class="h-5 w-5" />
					</div>
					<div class="flex-1">
						<p class="font-semibold text-on-surface">一键直达桌面</p>
						<p class="mt-0.5 text-xs text-on-surface-variant/80">
							无需输入网址，直接在桌面或 Dock 栏快捷启动。
						</p>
					</div>
				</li>
				<li class="flex items-start gap-3.5">
					<div
						class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
					>
						<WifiOffFill class="h-5 w-5" />
					</div>
					<div class="flex-1">
						<p class="font-semibold text-on-surface">完全离线可用</p>
						<p class="mt-0.5 text-xs text-on-surface-variant/80">
							自动本地缓存，断网无网状态下仍可查课表。
						</p>
					</div>
				</li>
				<li class="flex items-start gap-3.5">
					<div
						class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
					>
						<FullscreenFill class="h-5 w-5" />
					</div>
					<div class="flex-1">
						<p class="font-semibold text-on-surface">沉浸全屏窗口</p>
						<p class="mt-0.5 text-xs text-on-surface-variant/80">
							移除浏览器地址栏与边框，体验媲美原生 App。
						</p>
					</div>
				</li>
			</ul>
		</Card>

		<!-- Action / Guide Area -->
		{#if pwaInstallController.isStandalone}
			<Card variant="filled" class="!p-5 text-center">
				<p class="m3-title-small text-primary flex items-center justify-center gap-2 font-bold">
					<CheckCircleFill class="h-5 w-5" />
					<span>已成功安装 Chronos</span>
				</p>
				<p class="m3-body-small mt-1 text-on-surface-variant">
					你目前正在独立应用模式下运行，享受完整 PWA 体验。
				</p>
			</Card>
		{:else if pwaInstallController.isMacSafari}
			<!-- macOS Safari Guidance Card -->
			<Card variant="outlined" class="!p-5">
				<h3 class="m3-title-small mb-3 font-bold text-on-surface">macOS Safari 安装指引：</h3>
				<ol class="flex flex-col gap-3 text-xs leading-relaxed text-on-surface-variant">
					<li class="flex items-start gap-2.5">
						<span
							class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
							>1</span
						>
						<span>在屏幕顶部点击 Safari 菜单栏的 <strong>“文件” (File)</strong></span>
					</li>
					<li class="flex items-start gap-2.5">
						<span
							class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
							>2</span
						>
						<span>选择 <strong>“添加到 Dock...” (Add to Dock...)</strong></span>
					</li>
					<li class="flex items-start gap-2.5">
						<span
							class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
							>3</span
						>
						<span>点击 <strong>“添加”</strong> 确认即可从程序坞或启动台快捷打开</span>
					</li>
				</ol>
			</Card>
		{:else if pwaInstallController.isIOS}
			<!-- iOS / iPadOS Safari Guidance Card -->
			<Card variant="outlined" class="!p-5">
				<h3 class="m3-title-small mb-3 font-bold text-on-surface">iOS / iPadOS 安装指引：</h3>
				<ol class="flex flex-col gap-3 text-xs leading-relaxed text-on-surface-variant">
					<li class="flex items-start gap-2.5">
						<span
							class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
							>1</span
						>
						<span>
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
						<span>在列表中滑动选择 <strong>“添加到主屏幕”</strong></span>
					</li>
					<li class="flex items-start gap-2.5">
						<span
							class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
							>3</span
						>
						<span>点击右上角 <strong>“添加”</strong> 确认</span>
					</li>
				</ol>
			</Card>
		{:else}
			<!-- Chrome / Chromium Action Button & Clean Hint Card -->
			<Card variant="outlined" class="!p-5">
				<div class="flex flex-col gap-4">
					<div class="m3-actions">
						<Button variant="filled" size="m" iconType="left" onclick={handleInstallAction}>
							<AddHomeFill />
							<span>安装 Chronos 到设备</span>
						</Button>
					</div>

					<div
						class="rounded-xl bg-surface-container-high/60 p-3.5 text-xs text-on-surface-variant"
					>
						<p class="font-semibold text-on-surface">提示：</p>
						<p class="mt-1 leading-relaxed">
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
</SecondaryPageShell>
