<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { IosShareFill } from '$lib/icons';
	import { DEFAULT_TIMETABLE_NAME, normalizeTimetableName } from '$lib/models/timetable';
	import { getAppController } from '$lib/services/app-engine';
	import type { TimetableExporterAdapter } from '@chronos/core';

	let {
		transfer,
		currentTimetableName,
		longLinkWarning = false
	}: {
		transfer: TransferStateController;
		currentTimetableName: string | null;
		longLinkWarning?: boolean;
	} = $props();

	const controller = getAppController();
	let loading = $state(false);
	const exporters = $derived(controller.exporters);

	async function handleExportLink() {
		loading = true;
		try {
			const ok = await transfer.exportToClipboard();
			if (ok) {
				trackEvent('export_copy_link');
				snackbar('已复制课表链接');
				if (longLinkWarning) {
					trackEvent('export_long_link_warning_shown');
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

	function downloadFile(content: string | Uint8Array, filename: string, mimeType: string) {
		const blob = new Blob([content as BlobPart], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function handlePluginExport(exporter: TimetableExporterAdapter) {
		const current = controller.currentTimetable;
		if (!current) {
			snackbar('当前没有选中的课表');
			return;
		}
		loading = true;
		try {
			const result = await exporter.export(current);
			downloadFile(result.content, result.filename, result.mimeType);
			snackbar(`已导出《${result.filename}》`);
		} catch (err) {
			const msg = err instanceof Error ? err.message : '导出失败';
			snackbar(msg);
		} finally {
			loading = false;
		}
	}
</script>

{#snippet footer()}
	<div class="flex w-full flex-col gap-2">
		<Button
			variant="filled"
			class="w-full"
			disabled={loading || !currentTimetableName}
			onclick={handleExportLink}
		>
			<IosShareFill class="size-5" />
			{loading ? '导出中…' : '复制分享链接'}
		</Button>
	</div>
{/snippet}

<FormScreenLayout {footer}>
	<div class="space-y-6">
		<div
			class="m3-body-medium flex flex-col items-center justify-center gap-1 text-center text-on-surface-variant"
		>
			<p>
				将「{currentTimetableName
					? normalizeTimetableName(currentTimetableName)
					: DEFAULT_TIMETABLE_NAME}」导出或分享
			</p>
			<p>支持生成快速导入链接、日历文件及结构化备份</p>
			{#if longLinkWarning}
				<p class="text-warning">课表较大，部分应用可能截断链接内容</p>
			{/if}
		</div>

		{#if exporters.length > 0}
			<section class="space-y-3 rounded-2xl bg-surface-variant/40 p-4">
				<h3 class="m3-title-small text-on-surface-variant">更多格式导出</h3>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{#each exporters as exporter (exporter.id)}
						<Button
							variant="tonal"
							class="w-full justify-start"
							disabled={loading || !currentTimetableName}
							onclick={() => handlePluginExport(exporter)}
						>
							{typeof exporter.title === 'function' ? exporter.title() : exporter.title}
						</Button>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</FormScreenLayout>
