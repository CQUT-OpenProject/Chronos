<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
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

	import { DownloadFill } from '$lib/icons';
	import { countDistinctCourseNames } from '@chronos/core';
	import {
		MountableSlotOutlet,
		SchemaForm,
		findInvalidSchemaFields,
		type DateFieldLabels
	} from '@chronos/ui-kit';

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
	const activeSlot = $derived(
		transferState.previewSlotId
			? controller.getSlotItem('import.source.tab', transferState.previewSlotId)
			: undefined
	);
	const hasConfirmPhase = $derived(
		Boolean(activeSlot?.confirmComponent || activeSlot?.confirmSchema)
	);
	const confirmValidationError = $derived.by(() => {
		if (!activeSlot?.validateConfirmInputs) return null;
		return activeSlot.validateConfirmInputs(transferState.confirmInputs);
	});
	const hasInvalidConfirmInputs = $derived(
		activeSlot?.confirmSchema
			? findInvalidSchemaFields(activeSlot.confirmSchema, transferState.confirmInputs).length > 0
			: false
	);
	const canOverwrite = $derived(Boolean(currentTimetableName));
	const displayedCourseCount = $derived.by(() => {
		if (!preview) return 0;
		return countDistinctCourseNames(preview.courses);
	});
	let loading = $state(false);

	const dateFieldLabels = $derived<DateFieldLabels>({
		placeholder: hostT('ui.date.placeholder'),
		today: hostT('ui.date.today'),
		clear: hostT('ui.date.clear'),
		confirm: hostT('ui.date.confirm'),
		triggerEmpty: (label) => hostT('ui.date.trigger.empty', { label }),
		triggerLabeled: (label, display) => hostT('ui.date.trigger.labeled', { label, display })
	});

	function analyticsImportMode(mode: ImportMode) {
		return mode === ImportMode.AS_NEW ? 'as_new' : 'overwrite';
	}

	function selectImportMode(mode: ImportMode) {
		if (!transfer.setImportMode(mode)) {
			snackbarKey('transfer.confirm.noOverwrite');
			return;
		}
		trackEvent('import_mode_select', { mode: analyticsImportMode(mode) });
	}

	async function handleConfirm() {
		if (hasInvalidConfirmInputs) return;
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
				hasInvalidConfirmInputs ||
				(!canOverwrite && transferState.importMode === ImportMode.OVERWRITE_CURRENT) ||
				Boolean(confirmValidationError)}
			class="text-body-large h-12 w-full shadow-xs"
			onclick={handleConfirm}
		>
			{#if loading}
				<span>{hostT('transfer.confirm.importing')}</span>
			{:else}
				<DownloadFill class="size-5" />
				<span>
					{transferState.importMode === ImportMode.AS_NEW
						? hostT('transfer.confirm.asNew')
						: hostT('transfer.confirm.overwrite')}
				</span>
			{/if}
		</Button>
	{/snippet}

	<FormScreenLayout {footer}>
		<div class="flex flex-col gap-6 py-1">
			<Card variant="filled" class="border border-outline-variant/50 !bg-surface-variant/30 p-4.5">
				<div class="flex flex-col gap-3.5">
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-title-medium flex-1 text-on-surface">
							{preview.name}
						</h2>
						<span
							class="text-label-large inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-on-secondary-container"
						>
							{resolveSlotTitle(transferState.previewSlotId)}
						</span>
					</div>

					<div class="grid grid-cols-3 gap-2.5">
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="text-body-small text-on-surface-variant">
								{hostT('transfer.confirm.stats.courses')}
							</span>
							<span class="text-title-large mt-0.5 font-bold text-on-surface"
								>{displayedCourseCount}</span
							>
						</div>
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="text-body-small text-on-surface-variant">
								{hostT('transfer.confirm.stats.startWeek')}
							</span>
							<span class="text-title-large mt-0.5 font-bold text-on-surface"
								>{preview.academicConfig?.startWeek ?? 1}</span
							>
						</div>
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="text-body-small text-on-surface-variant">
								{hostT('transfer.confirm.stats.endWeek')}
							</span>
							<span class="text-title-large mt-0.5 font-bold text-on-surface"
								>{preview.academicConfig?.endWeek ?? 20}</span
							>
						</div>
					</div>
				</div>
			</Card>

			{#if hasConfirmPhase}
				<div class="flex flex-col gap-3">
					{#if activeSlot?.confirmComponent}
						<MountableSlotOutlet
							component={activeSlot.confirmComponent}
							props={{ controller, transfer }}
							class="w-full"
						/>
					{:else if activeSlot?.confirmSchema}
						<SchemaForm
							schema={activeSlot.confirmSchema}
							value={transferState.confirmInputs}
							onValueChange={(next) => transfer.setConfirmInputs(next)}
							{dateFieldLabels}
							{controller}
						/>
					{/if}
				</div>
			{/if}

			<div class="flex flex-col gap-3">
				<h3 class="text-title-medium px-1 text-on-surface">
					{hostT('transfer.confirm.mode.heading')}
				</h3>

				<div class="flex flex-col gap-2.5">
					<SelectableOption
						name="import-mode"
						label={hostT('transfer.confirm.mode.asNew')}
						selected={transferState.importMode === ImportMode.AS_NEW}
						onclick={() => selectImportMode(ImportMode.AS_NEW)}
					/>

					<SelectableOption
						name="import-mode"
						label={hostT('transfer.confirm.mode.overwrite')}
						description={currentTimetableName
							? hostT('transfer.confirm.mode.currentDesc', {
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
