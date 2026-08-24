<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import { getAppController } from '$lib/services/app-engine';
	import {
		pickPrimary,
		resolveLocalizedText,
		type ExportResult,
		type ExportActionSlotContribution
	} from '@chronos/core';
	import Button from '$lib/components/ui/Button.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import { snackbar, snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
	import { hostText, hostTextRead } from '$lib/i18n/host-text';
	import { DEFAULT_TIMETABLE_NAME, normalizeTimetableName } from '$lib/models/timetable';

	let {
		warningMessage = null
	}: {
		warningMessage?: string | null;
	} = $props();

	const controller = getAppController();
	const currentTimetable = $derived(controller.currentTimetable);
	const allExportActions = $derived(controller.getSlots('export.action'));
	const defaultActionId = $derived(pickPrimary(allExportActions)?.id ?? allExportActions[0]?.id);

	let selectedId = $state<string | null>(null);
	let runningId = $state<string | null>(null);

	const selectedAction = $derived(
		allExportActions.find((a) => a.id === (selectedId ?? defaultActionId)) ?? null
	);
	const segments = $derived(
		allExportActions.map((action) => ({
			value: action.id,
			label: resolveLocalizedText(action.title)
		}))
	);
	const showExportTabs = $derived(segments.length > 0);

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

	async function copyTextSafely(text: string): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// 非安全上下文或权限被拒：回退到临时文本域 + execCommand
			try {
				const textarea = document.createElement('textarea');
				textarea.value = text;
				textarea.style.position = 'fixed';
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.select();
				const ok = document.execCommand('copy');
				document.body.removeChild(textarea);
				return ok;
			} catch {
				return false;
			}
		}
	}

	function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			const timer = setTimeout(() => reject(new Error(hostText('transfer.export.timeout'))), ms);
			promise.then(
				(value) => {
					clearTimeout(timer);
					resolve(value);
				},
				(error) => {
					clearTimeout(timer);
					reject(error);
				}
			);
		});
	}

	async function handleActionExport(action: ExportActionSlotContribution) {
		const current = controller.currentTimetable;
		if (!current) {
			snackbarKey('transfer.export.noTimetable');
			return;
		}
		if (runningId) return;

		runningId = action.id;
		trackEvent('export_slot_execute_attempt', { actionId: action.id });
		try {
			const ctx = controller.getPluginContextForSlot('export.action', action.id);
			const result = await withTimeout(action.export(current, ctx));
			const disposition = result.disposition ?? action.disposition ?? 'download';

			if (disposition === 'clipboard') {
				const text = typeof result.content === 'string' ? result.content : '';
				const copied = await withTimeout(copyTextSafely(text));
				if (!copied) throw new Error(hostText('transfer.export.copyFailed'));
				trackEvent('export_copy_link');
				snackbar(
					resolveLocalizedText(result.successMessage) || hostText('transfer.export.linkCopied')
				);
				return;
			}

			if (disposition === 'download') {
				downloadExportResult(result);
				trackEvent('export_slot_execute_success', { actionId: action.id });
				snackbar(
					resolveLocalizedText(result.successMessage) ||
						hostText('transfer.export.fileSaved', {
							filename: result.filename ?? hostText('timetable.defaultName')
						})
				);
				return;
			}

			if (result.successMessage) {
				snackbar(resolveLocalizedText(result.successMessage));
			}
		} catch (err: unknown) {
			trackEvent('export_slot_execute_fail', { actionId: action.id });
			snackbar(err instanceof Error ? err.message : hostText('transfer.export.failed'));
		} finally {
			runningId = null;
		}
	}

	function actionDescription(action: ExportActionSlotContribution): string {
		return (
			resolveLocalizedText(action.description) ||
			hostTextRead(controller, 'transfer.export.defaultDesc')
		);
	}

	function exportButtonLabel(action: ExportActionSlotContribution): string {
		return hostText('transfer.export.button', { title: resolveLocalizedText(action.title) });
	}
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-5 py-1">
	<p class="m3-body-medium text-center text-on-surface-variant">
		{hostTextRead(controller, 'transfer.export.intro', {
			name: currentTimetable
				? normalizeTimetableName(currentTimetable.name)
				: DEFAULT_TIMETABLE_NAME
		})}
	</p>

	{#if warningMessage}
		<p class="m3-body-small text-center text-warning">{warningMessage}</p>
	{/if}

	{#if showExportTabs}
		<SegmentedControl
			{segments}
			value={selectedAction?.id ?? ''}
			onValueChange={(id) => (selectedId = id)}
		/>
	{/if}

	{#if selectedAction}
		<div class="flex flex-col gap-3 rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs">
			<div>
				<h2 class="m3-title-medium text-on-surface">
					{resolveLocalizedText(selectedAction.title)}
				</h2>
				<p class="m3-body-small mt-0.5 text-on-surface-variant">
					{actionDescription(selectedAction)}
				</p>
			</div>
			<Button
				variant="filled"
				class="w-full"
				disabled={runningId !== null || !currentTimetable}
				onclick={() => handleActionExport(selectedAction)}
			>
				{runningId === selectedAction.id
					? hostTextRead(controller, 'transfer.export.exporting')
					: exportButtonLabel(selectedAction)}
			</Button>
		</div>
	{:else}
		<div
			class="rounded-2xl border border-outline/30 bg-surface p-6 text-center text-on-surface-variant shadow-xs"
		>
			{hostTextRead(controller, 'transfer.export.noMethod')}
		</div>
	{/if}
</div>
