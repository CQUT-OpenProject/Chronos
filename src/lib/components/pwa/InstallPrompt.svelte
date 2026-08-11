<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import { IosShareFill } from '$lib/icons';

	function goToInstallPage() {
		pwaInstallController.dismiss();
		void goto(resolve('/about/install'));
	}
</script>

<!-- Already installed: open in standalone app -->
<Dialog
	bind:open={pwaInstallController.openInAppDialogOpen}
	title="Chronos 已安装"
	description="检测到您已安装 Chronos，建议在独立应用窗口中打开以获得完整体验。"
>
	{#snippet footer()}
		<Button variant="text" onclick={() => pwaInstallController.dismiss()}>继续在浏览器</Button>
		<Button variant="filled" onclick={() => pwaInstallController.openInApp()}>在应用中打开</Button>
	{/snippet}
</Dialog>

<!-- Android / Desktop Install Dialog -->
<Dialog
	bind:open={pwaInstallController.installDialogOpen}
	title="安装 Chronos"
	description="将 Chronos 添加到主屏幕后，可以快捷打开应用。"
>
	{#snippet footer()}
		<Button variant="text" onclick={() => pwaInstallController.dismiss()}>稍后</Button>
		<Button variant="filled" onclick={goToInstallPage}>安装</Button>
	{/snippet}
</Dialog>

<!-- iOS Safari Guide Dialog -->
<Dialog bind:open={pwaInstallController.iosGuideOpen} title="安装 Chronos">
	<div class="m3-body-medium flex flex-col gap-3 text-left leading-relaxed text-on-surface-variant">
		<p>将 Chronos 添加到主屏幕后，可以快捷打开应用。</p>
		<ol class="flex flex-col gap-2 pt-1">
			<li class="flex items-start gap-2">
				<span class="m3-step-badge">1</span>
				<span class="m3-body-medium">
					点击 Safari 浏览器底部的 <strong class="inline-flex items-center gap-1 text-on-surface">
						分享图标 <IosShareFill class="inline h-4 w-4 text-brand" />
					</strong>
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="m3-step-badge">2</span>
				<span class="m3-body-medium">
					选择 <strong class="text-on-surface">“添加到主屏幕”</strong>
				</span>
			</li>
		</ol>
	</div>
	{#snippet footer()}
		<Button variant="filled" onclick={goToInstallPage}>查看安装指引</Button>
	{/snippet}
</Dialog>
