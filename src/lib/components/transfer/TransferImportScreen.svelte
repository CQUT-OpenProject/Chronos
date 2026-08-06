<script lang="ts">
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';

	let {
		transfer,
		onContinue
	}: {
		transfer: TransferStateController;
		onContinue: () => void;
	} = $props();

	const transferState = $derived(transfer.state);
	let fileInput: HTMLInputElement | undefined = $state();
	let loading = $state(false);

	async function handleClipboardPreview() {
		loading = true;
		try {
			const ok = await transfer.previewFromClipboard();
			if (ok) onContinue();
		} finally {
			loading = false;
		}
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		loading = true;
		try {
			const ok = await transfer.previewFromHtmlFile(file);
			if (ok) onContinue();
		} finally {
			loading = false;
			input.value = '';
		}
	}
</script>

<div class="space-y-6 p-4">
	<div>
		<h1 class="text-xl font-semibold">导入课表</h1>
		<p class="mt-1 text-sm text-zinc-500">支持分享 JSON 与教务 HTML 文件。在线导入将在 M4 提供。</p>
	</div>

	<div class="flex gap-2">
		<button
			type="button"
			class="rounded-lg px-3 py-2 text-sm {transferState.selectedSource === 'JSON'
				? 'bg-blue-600 text-white'
				: 'border border-zinc-300'}"
			onclick={() => transfer.setSelectedSource('JSON')}
		>
			分享 JSON
		</button>
		<button
			type="button"
			class="rounded-lg px-3 py-2 text-sm {transferState.selectedSource === 'HTML'
				? 'bg-blue-600 text-white'
				: 'border border-zinc-300'}"
			onclick={() => transfer.setSelectedSource('HTML')}
		>
			HTML 文件
		</button>
	</div>

	{#if transferState.selectedSource === 'JSON'}
		<section class="space-y-3 rounded-xl border border-zinc-200 p-4">
			<h2 class="font-medium">从分享内容获取</h2>
			<p class="text-sm text-zinc-500">复制 Android 或其他设备导出的课表 JSON 后点击下方按钮。</p>
			<button
				type="button"
				class="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
				disabled={loading}
				onclick={handleClipboardPreview}
			>
				{loading ? '读取中…' : '从剪贴板导入课表'}
			</button>
		</section>
	{:else}
		<section class="space-y-3 rounded-xl border border-zinc-200 p-4">
			<h2 class="font-medium">从文件导入课表</h2>
			<p class="text-sm text-zinc-500">选择教务系统导出的 HTML 课表文件。</p>
			<input
				bind:this={fileInput}
				type="file"
				accept=".html,.htm,text/html"
				class="hidden"
				onchange={handleFileChange}
			/>
			<button
				type="button"
				class="rounded-lg border border-zinc-300 px-4 py-2 disabled:opacity-60"
				disabled={loading}
				onclick={() => fileInput?.click()}
			>
				{loading ? '解析中…' : '选择 HTML 文件'}
			</button>
		</section>
	{/if}

	{#if transferState.preview}
		<div class="rounded-lg bg-zinc-100 px-3 py-2 text-sm">
			当前预览：{transferState.preview.name}（{transferState.preview.courses.length} 门课程）
			<button type="button" class="ml-2 text-blue-600" onclick={() => transfer.clearPreview()}>
				清除
			</button>
		</div>
	{/if}

	{#if transferState.errorMessage}
		<p class="text-sm text-red-600">{transferState.errorMessage}</p>
	{/if}
</div>
