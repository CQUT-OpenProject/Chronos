<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import { AddHomeFill, CheckCircleFill, IosShareFill, RocketLaunchFill } from '$lib/icons';

	async function handleInstallAction() {
		if (pwaInstallController.isStandalone) {
			snackbar('当前已成功安装为桌面应用');
			return;
		}

		if (pwaInstallController.isInstalledLocally) {
			pwaInstallController.openInApp();
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

{#if pwaInstallController.isStandalone}
	<Card variant="filled" class="text-center">
		<p class="m3-title-small flex items-center justify-center gap-2 text-brand">
			<CheckCircleFill class="h-5 w-5" />
			<span>Chronos 已安装</span>
		</p>
		<p class="m3-body-small text-on-surface-variant">
			你目前正在独立应用模式下运行，享受完整 PWA 体验
		</p>
	</Card>
{:else if pwaInstallController.isInstalledLocally}
	<Card variant="outlined">
		<div class="flex flex-col gap-4">
			<p class="m3-title-small flex items-center justify-center gap-2 text-brand">
				<CheckCircleFill class="h-5 w-5" />
				<span>Chronos 已安装</span>
			</p>
			<p class="m3-body-small text-center text-on-surface-variant">
				检测到您已安装 Chronos，建议在独立应用窗口中打开
			</p>
			<Button variant="filled" class="w-full" onclick={() => pwaInstallController.openInApp()}>
				<RocketLaunchFill class="size-5" />
				<span>在应用中打开</span>
			</Button>
		</div>
	</Card>
{:else if pwaInstallController.isMacSafari}
	<!-- macOS Safari Guidance Card -->
	<Card variant="outlined">
		<h3 class="m3-title-small mb-3 text-on-surface">macOS Safari 安装指引：</h3>
		<ol class="flex flex-col gap-3 text-on-surface-variant">
			<li class="flex items-start gap-2.5">
				<span class="m3-step-badge">1</span>
				<span class="m3-body-small"
					>在屏幕顶部点击 Safari 菜单栏的 <strong>“文件” (File)</strong></span
				>
			</li>
			<li class="flex items-start gap-2.5">
				<span class="m3-step-badge">2</span>
				<span class="m3-body-small">选择 <strong>“添加到 Dock...” (Add to Dock...)</strong></span>
			</li>
			<li class="flex items-start gap-2.5">
				<span class="m3-step-badge">3</span>
				<span class="m3-body-small"
					>点击 <strong>“添加”</strong> 确认即可从程序坞或启动台快捷打开</span
				>
			</li>
		</ol>
	</Card>
{:else if pwaInstallController.isIOS}
	<!-- iOS / iPadOS Safari Guidance Card -->
	<Card variant="outlined">
		<h3 class="m3-title-small mb-3 text-on-surface">iOS / iPadOS 安装指引：</h3>
		<ol class="flex flex-col gap-3 text-on-surface-variant">
			<li class="flex items-start gap-2.5">
				<span class="m3-step-badge">1</span>
				<span class="m3-body-small">
					点击 Safari 底部的 <strong>
						分享图标 <IosShareFill class="inline h-3.5 w-3.5 text-brand" />
					</strong>
				</span>
			</li>
			<li class="flex items-start gap-2.5">
				<span class="m3-step-badge">2</span>
				<span class="m3-body-small">在列表中滑动选择 <strong>“添加到主屏幕”</strong></span>
			</li>
			<li class="flex items-start gap-2.5">
				<span class="m3-step-badge">3</span>
				<span class="m3-body-small">点击右上角 <strong>“添加”</strong> 确认</span>
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
				<p class="m3-body-large text-on-surface">提示：</p>
				<p class="m3-body-small">
					若点击按钮未弹出安装窗口，亦可点击地址栏右侧的安装图标 ⊕，或在菜单中选择「安装 Chronos」。
				</p>
			</div>
		</div>
	</Card>
{/if}
