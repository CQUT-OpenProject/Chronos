<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import { ImportMode } from '$lib/domain/import-mode';
	import {
		resolveSlotTitle,
		type TransferStateController
	} from '$lib/transfer/transfer-state.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import SelectableOption from '$lib/components/ui/SelectableOption.svelte';
	import { snackbar, snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';
	import { DownloadFill } from '$lib/icons';
	import { countDistinctCourseNames } from '@chronos/core';

	let {
		transfer,
		currentTimetableName,
		onConfirm
	}: {
		transfer: TransferStateController;
		currentTimetableName: string | null;
		onConfirm: () => void;
	} = $props();

	const controller = getAppController();
	const transferState = $derived(transfer.state);
	const preview = $derived(transferState.preview);
	const canOverwrite = $derived(Boolean(currentTimetableName));
	const displayedCourseCount = $derived.by(() => {
		if (!preview) return 0;
		return countDistinctCourseNames(preview.courses);
	});
	let loading = $state(false);

	function analyticsImportMode(mode: ImportMode) {
		return mode === ImportMode.AS_NEW ? 'as_new' : 'overwrite';
	}

	function selectImportMode(mode: ImportMode) {
		if (mode === ImportMode.OVERWRITE_CURRENT && !canOverwrite) {
			snackbarKey('transfer.confirm.noOverwrite');
			return;
		}
		transfer.setImportMode(mode);
		trackEvent('import_mode_select', { mode: analyticsImportMode(mode) });
	}

	async function handleConfirm() {
		if (transferState.importMode === ImportMode.OVERWRITE_CURRENT && !canOverwrite) {
			snackbarKey('transfer.confirm.noOverwrite');
			return;
		}
		loading = true;
		const mode = analyticsImportMode(transferState.importMode);
		try {
			const ok = await transfer.confirmImport();
			trackEvent('import_confirm', { mode, success: ok });
			if (ok) {
				snackbarKey('transfer.confirm.success');
				onConfirm();
				return;
			}
			const message = transfer.state.errorMessage;
			if (message) snackbar(message);
		} finally {
			loading = false;
		}
	}
</script>

{#if preview}
	{#snippet footer()}
		<Button
			variant="filled"
			disabled={loading ||
				(!canOverwrite && transferState.importMode === ImportMode.OVERWRITE_CURRENT)}
			class="m3-body-large h-12 w-full shadow-xs"
			onclick={handleConfirm}
		>
			{#if loading}
				<span>{hostTextRead(controller, 'transfer.confirm.importing')}</span>
			{:else}
				<DownloadFill class="size-5" />
				<span>
					{transferState.importMode === ImportMode.AS_NEW
						? hostTextRead(controller, 'transfer.confirm.asNew')
						: hostTextRead(controller, 'transfer.confirm.overwrite')}
				</span>
			{/if}
		</Button>
	{/snippet}

	<FormScreenLayout {footer}>
		<div class="flex flex-col gap-6 py-1">
			<Card variant="filled" class="border border-outline-variant/50 !bg-surface-variant/30 p-4.5">
				<div class="flex flex-col gap-3.5">
					<div class="flex items-center justify-between gap-3">
						<h2 class="m3-title-medium flex-1 text-on-surface">
							{preview.name}
						</h2>
						<span
							class="m3-label-large inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container"
						>
							{resolveSlotTitle(transferState.previewSlotId)}
						</span>
					</div>

					<div class="grid grid-cols-3 gap-2.5">
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="m3-body-small text-on-surface-variant">
								{hostTextRead(controller, 'transfer.confirm.stats.courses')}
							</span>
							<span class="m3-title-large mt-0.5 font-bold text-on-surface"
								>{displayedCourseCount}</span
							>
						</div>
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="m3-body-small text-on-surface-variant">
								{hostTextRead(controller, 'transfer.confirm.stats.startWeek')}
							</span>
							<span class="m3-title-large mt-0.5 font-bold text-on-surface"
								>{preview.academicConfig?.startWeek ?? 1}</span
							>
						</div>
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="m3-body-small text-on-surface-variant">
								{hostTextRead(controller, 'transfer.confirm.stats.endWeek')}
							</span>
							<span class="m3-title-large mt-0.5 font-bold text-on-surface"
								>{preview.academicConfig?.endWeek ?? 20}</span
							>
						</div>
					</div>
				</div>
			</Card>

			<div class="flex flex-col gap-3">
				<h3 class="m3-title-medium px-1 text-on-surface">
					{hostTextRead(controller, 'transfer.confirm.mode.heading')}
				</h3>

				<div class="flex flex-col gap-2.5">
					<SelectableOption
						name="import-mode"
						label={hostTextRead(controller, 'transfer.confirm.mode.asNew')}
						selected={transferState.importMode === ImportMode.AS_NEW}
						onclick={() => selectImportMode(ImportMode.AS_NEW)}
					/>

					<SelectableOption
						name="import-mode"
						label={hostTextRead(controller, 'transfer.confirm.mode.overwrite')}
						description={currentTimetableName
							? hostTextRead(controller, 'transfer.confirm.mode.currentDesc', {
									name: currentTimetableName
								})
							: undefined}
						disabled={!canOverwrite}
						selected={transferState.importMode === ImportMode.OVERWRITE_CURRENT}
						onclick={() => selectImportMode(ImportMode.OVERWRITE_CURRENT)}
					/>
				</div>
			</div>
		</div>
	</FormScreenLayout>
{/if}
