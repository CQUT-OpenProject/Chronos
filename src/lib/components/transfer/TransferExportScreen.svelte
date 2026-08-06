<script lang="ts">
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';

	let {
		transfer,
		currentTimetableName
	}: {
		transfer: TransferStateController;
		currentTimetableName: string | null;
	} = $props();

	const transferState = $derived(transfer.state);
	let loading = $state(false);

	async function handleExport() {
		loading = true;
		try {
			await transfer.exportToClipboard();
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6 p-4">
	<div>
		<h1 class="text-xl font-semibold">导出课表</h1>
		<p class="mt-1 text-sm text-zinc-500">
			将当前课表复制为分享 JSON，可在 Android 或其他设备导入。
		</p>
	</div>

	<section class="rounded-xl border border-zinc-200 p-4">
		{#if currentTimetableName}
			<p class="font-medium">{currentTimetableName}</p>
			<p class="mt-1 text-sm text-zinc-500">导出格式与 Android 共享 JSON 兼容（短键）。</p>
		{:else}
			<p class="text-sm text-zinc-500">当前没有可导出的课表。</p>
		{/if}
	</section>

	<button
		type="button"
		class="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
		disabled={loading || !currentTimetableName}
		onclick={handleExport}
	>
		{loading ? '导出中…' : '复制到剪贴板'}
	</button>

	{#if transferState.statusMessage}
		<p class="text-sm text-green-700">{transferState.statusMessage}</p>
	{/if}
	{#if transferState.errorMessage}
		<p class="text-sm text-red-600">{transferState.errorMessage}</p>
	{/if}
</div>
