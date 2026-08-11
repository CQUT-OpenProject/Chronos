<script lang="ts">
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { IosShareFill } from '$lib/icons';
	import { DEFAULT_TIMETABLE_NAME, normalizeTimetableName } from '$lib/models/timetable';

	let {
		transfer,
		currentTimetableName,
		longLinkWarning = false
	}: {
		transfer: TransferStateController;
		currentTimetableName: string | null;
		longLinkWarning?: boolean;
	} = $props();

	let loading = $state(false);

	async function handleExport() {
		loading = true;
		try {
			const ok = await transfer.exportToClipboard();
			if (ok) {
				snackbar('已复制课表链接');
				if (longLinkWarning) {
					snackbar('课表较大，部分应用可能截断链接内容，请注意核对导入结果');
				}
				return;
			}
			const message = transfer.state.errorMessage;
			if (message) snackbar(message);
		} finally {
			loading = false;
		}
	}
</script>

{#snippet footer()}
	<Button
		variant="filled"
		class="w-full"
		disabled={loading || !currentTimetableName}
		onclick={handleExport}
	>
		<IosShareFill class="size-5" />
		{loading ? '导出中…' : '复制课表链接'}
	</Button>
{/snippet}

<FormScreenLayout {footer}>
	<div
		class="m3-body-medium flex min-h-full flex-col items-center justify-center gap-1 text-center text-on-surface-variant"
	>
		<p>
			将「{currentTimetableName
				? normalizeTimetableName(currentTimetableName)
				: DEFAULT_TIMETABLE_NAME}」复制为分享链接
		</p>
		<p>选择从【分享链接】导入 / 在浏览器中打开链接即可自动导入课表</p>
		{#if longLinkWarning}
			<p class="text-warning">课表较大，部分应用可能截断链接内容</p>
		{/if}
	</div>
</FormScreenLayout>
