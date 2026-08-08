<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import { IosShareFill } from '$lib/icons';

	onMount(() => {
		return pwaInstallController.init();
	});
</script>

<!-- Android / Desktop Install Dialog -->
<Dialog
	bind:open={pwaInstallController.installDialogOpen}
	title="安装 Chronos"
	description="将 Chronos 添加到主屏幕后，可以快捷打开应用。"
>
	{#snippet footer()}
		<Button variant="text" onclick={() => pwaInstallController.dismiss()}>稍后</Button>
		<Button variant="filled" onclick={() => pwaInstallController.install()}>安装</Button>
	{/snippet}
</Dialog>

<!-- iOS Safari Guide Dialog -->
<Dialog bind:open={pwaInstallController.iosGuideOpen} title="安装 Chronos">
	<div class="flex flex-col gap-3 text-left text-sm leading-relaxed text-on-surface-variant">
		<p class="m3-body-medium">将 Chronos 添加到主屏幕后，可以快捷打开应用。</p>
		<ol class="flex flex-col gap-2 pt-1">
			<li class="flex items-start gap-2">
				<span
					class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
					>1</span
				>
				<span>
					点击 Safari 浏览器底部的 <strong class="inline-flex items-center gap-1 text-on-surface">
						分享图标 <IosShareFill class="text-primary inline h-4 w-4" />
					</strong>
				</span>
			</li>
			<li class="flex items-start gap-2">
				<span
					class="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
					>2</span
				>
				<span>
					选择 <strong class="text-on-surface">“添加到主屏幕”</strong>
				</span>
			</li>
		</ol>
	</div>
	{#snippet footer()}
		<Button variant="filled" onclick={() => pwaInstallController.dismiss()}>知道了</Button>
	{/snippet}
</Dialog>
