<script lang="ts">
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { Button } from 'm3-svelte';
	import { IosShare } from '$lib/icons';

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

<div class="m3-stack">
	<p class="m3-body-medium text-on-surface-variant">
		将“{currentTimetableName ?? '未命名'}”复制为链接。
	</p>

	<Button variant="outlined" disabled={loading || !currentTimetableName} onclick={handleExport}>
		<IosShare class="mr-2 size-5" />
		{loading ? '导出中…' : '复制课表链接'}
	</Button>

	{#if transferState.statusMessage}
		<p class="m3-body-medium text-success">{transferState.statusMessage}</p>
	{/if}
	{#if transferState.errorMessage}
		<p class="m3-body-medium text-danger">{transferState.errorMessage}</p>
	{/if}
</div>

<style>
	p {
		margin: 0;
	}

	p + p {
		margin-top: 0.25rem;
	}
</style>
