<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import { getAppController } from '$lib/services/app-engine';
	import {
		pickPrimary,
		resolveLocalizedText,
		type ExportResult,
		type ExportActionSlotContribution
	} from '@chronos/core';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { IosShareFill } from '$lib/icons';
	import { DEFAULT_TIMETABLE_NAME, normalizeTimetableName } from '$lib/models/timetable';

	let {
		currentTimetableName,
		warningMessage = null
	}: {
		currentTimetableName: string | null;
		warningMessage?: string | null;
	} = $props();

	const controller = getAppController();
	const allExportActions = $derived(controller.getSlots('export.action'));
	const primaryAction = $derived(pickPrimary(allExportActions));
	const secondaryActions = $derived(allExportActions.filter((a) => a.id !== primaryAction?.id));

	let loading = $state(false);

	function downloadExportResult(result: ExportResult) {
		const blob = new Blob([result.content], { type: result.mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = result.filename ?? 'timetable-export';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
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
			const ctx = controller.getPluginContextForSlot('export.action', action.id);
			const result = await action.export(current, ctx);
			const disposition = result.disposition ?? action.disposition ?? 'download';

			if (disposition === 'clipboard') {
				const text = typeof result.content === 'string' ? result.content : '';
				await navigator.clipboard.writeText(text);
				trackEvent('export_copy_link');
				const msg = resolveLocalizedText(result.successMessage) || '已复制课表链接';
				snackbar(msg);
				if (warningMessage) {
					trackEvent('export_long_link_warning_shown');
					snackbar(warningMessage);
				}
				return;
			}

			if (disposition === 'download' && result) {
				downloadExportResult(result);
				trackEvent('export_slot_execute_success', { actionId: action.id });
				const msg =
					resolveLocalizedText(result.successMessage) || `已导出《${result.filename ?? '课表'}》`;
				snackbar(msg);
				return;
			}

			if (result.successMessage) {
				snackbar(resolveLocalizedText(result.successMessage));
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
	{#if primaryAction}
		<Button
			variant="filled"
			class="w-full"
			disabled={loading || !currentTimetableName}
			onclick={() => handleActionExport(primaryAction)}
		>
			<IosShareFill class="size-5" />
			{loading ? '导出中…' : resolveLocalizedText(primaryAction.title)}
		</Button>
	{/if}
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
			{#if warningMessage}
				<p class="text-warning">{warningMessage}</p>
			{/if}
		</div>

		{#if secondaryActions.length > 0}
			<section class="flex flex-col gap-3">
				<h3 class="m3-title-medium px-1 text-on-surface">更多导出格式</h3>
				<div class="flex flex-col gap-2.5">
					{#each secondaryActions as action (action.id)}
						<Card variant="outlined">
							<div class="flex items-center justify-between p-3.5">
								<div class="flex flex-col">
									<span class="m3-title-small font-medium text-on-surface">
										{resolveLocalizedText(action.title)}
									</span>
									<span class="m3-body-small text-on-surface-variant">
										{resolveLocalizedText(action.description) || '导出为标准文件产物'}
									</span>
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
