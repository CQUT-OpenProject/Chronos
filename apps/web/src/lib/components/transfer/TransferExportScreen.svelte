<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import type { ExportResult, ExportActionSlotContribution } from '@chronos/core';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
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

	const controller = getAppController();
	const exportActions = $derived(controller.getSlots('export.action'));

	let loading = $state(false);

	function resolveText(text: string | (() => string) | undefined): string {
		if (!text) return '';
		return typeof text === 'function' ? text() : text;
	}

	function downloadExportResult(result: ExportResult) {
		const blob = new Blob([result.content], { type: result.mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = result.filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function handleShareLinkExport() {
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

	async function handleActionExport(action: ExportActionSlotContribution) {
		const current = controller.currentTimetable;
		if (!current) {
			snackbar('当前没有可导出的课表');
			return;
		}
		loading = true;
		trackEvent('export_slot_execute_attempt', { actionId: action.id });
		try {
			const ctx = controller.rawEngine.getPluginContext(action.id);
			const result = await action.export(current, ctx);
			if (result) {
				downloadExportResult(result);
				trackEvent('export_slot_execute_success', { actionId: action.id });
				snackbar(`已导出《${result.filename}》`);
			}
		} catch (err: unknown) {
			trackEvent('export_slot_execute_fail', { actionId: action.id });
			const msg = err instanceof Error ? err.message : '导出失败';
			snackbar(msg);
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
		onclick={handleShareLinkExport}
	>
		<IosShareFill class="size-5" />
		{loading ? '导出中…' : '复制课表分享链接'}
	</Button>
{/snippet}

<FormScreenLayout {footer}>
	<div class="flex flex-col gap-6 py-2">
		<div
			class="m3-body-medium flex flex-col items-center justify-center gap-1 text-center text-on-surface-variant"
		>
			<p>
				将「{currentTimetableName
					? normalizeTimetableName(currentTimetableName)
					: DEFAULT_TIMETABLE_NAME}」导出或分享
			</p>
			<p>支持生成在线分享短链，或通过插件导出为结构化数据文件</p>
			{#if longLinkWarning}
				<p class="text-warning">课表较大，部分应用可能截断链接内容</p>
			{/if}
		</div>

		{#if exportActions.length > 0}
			<section class="flex flex-col gap-3">
				<h3 class="m3-title-medium px-1 text-on-surface">扩展导出格式</h3>
				<div class="flex flex-col gap-2.5">
					{#each exportActions as action (action.id)}
						<Card variant="outlined">
							<div class="flex items-center justify-between p-3.5">
								<div class="flex flex-col">
									<span class="m3-title-small font-medium text-on-surface">
										{resolveText(action.title)}
									</span>
									<span class="m3-body-small text-on-surface-variant"> 导出为标准文件产物 </span>
								</div>
								<Button
									variant="tonal"
									disabled={loading || !currentTimetableName}
									onclick={() => handleActionExport(action)}
								>
									导出
								</Button>
							</div>
						</Card>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</FormScreenLayout>
