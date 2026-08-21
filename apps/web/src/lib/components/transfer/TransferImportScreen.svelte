<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { SchemaForm } from '@chronos/ui-kit';

	let {
		transfer,
		onContinue
	}: {
		transfer: TransferStateController;
		onContinue: () => void;
	} = $props();

	const controller = getAppController();
	const availableSlots = $derived(controller.getSlots('import.source.tab'));
	const importSegments = $derived(
		availableSlots.map((slot) => ({
			value: slot.id,
			label: typeof slot.title === 'function' ? slot.title() : slot.title
		}))
	);
	const activeSlot = $derived(
		availableSlots.find((slot) => slot.id === transfer.state.selectedSlotId) ?? availableSlots[0]
	);

	const hasOnlineImport = $derived(availableSlots.some((slot) => slot.id === 'cqut-online'));
	const importDescription = $derived(
		hasOnlineImport
			? '支持知行理工在线导入、分享链接与教务系统导出的 HTML 文件。'
			: availableSlots.some((slot) => slot.id === 'edu-html')
				? '支持分享链接与教务系统导出的 HTML 文件。'
				: '支持分享链接导入课表。'
	);

	let schemaFormValues = $state<Record<string, unknown>>({});
	let schemaLoading = $state(false);

	function handleSourceChange(slotId: string) {
		transfer.setSelectedSlotId(slotId);
		trackEvent('import_source_select', { slotId });
	}

	async function handleSchemaSubmit() {
		if (!activeSlot) return;
		schemaLoading = true;
		try {
			const ok = await transfer.previewWithSlot(activeSlot.id, schemaFormValues);
			if (ok) onContinue();
			else if (transfer.state.errorMessage) snackbar(transfer.state.errorMessage);
		} finally {
			schemaLoading = false;
		}
	}
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-5 py-1">
	<p class="m3-body-medium text-on-surface-variant">
		{importDescription}
	</p>

	{#if importSegments.length > 1}
		<SegmentedControl
			segments={importSegments}
			value={transfer.state.selectedSlotId}
			onValueChange={handleSourceChange}
		/>
	{/if}

	<div class="w-full">
		{#if activeSlot?.component}
			{@const DynamicComponent = activeSlot.component}
			<DynamicComponent {controller} {transfer} {onContinue} />
		{:else if activeSlot?.inputSchema}
			<div class="rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs">
				<div class="flex flex-col gap-4">
					<div>
						<h2 class="m3-title-medium text-on-surface">
							{typeof activeSlot.title === 'function' ? activeSlot.title() : activeSlot.title}
						</h2>
						{#if activeSlot.supportingText}
							<p class="m3-body-small mt-0.5 text-on-surface-variant">
								{typeof activeSlot.supportingText === 'function'
									? activeSlot.supportingText()
									: activeSlot.supportingText}
							</p>
						{/if}
					</div>
					<SchemaForm schema={activeSlot.inputSchema} bind:value={schemaFormValues} {controller} />
					<button
						type="button"
						class="m3-label-large w-full rounded-full bg-primary py-3 text-center font-medium text-on-primary disabled:opacity-50"
						disabled={schemaLoading}
						onclick={handleSchemaSubmit}
					>
						{schemaLoading ? '获取中…' : '导入课表'}
					</button>
				</div>
			</div>
		{:else}
			<div
				class="rounded-2xl border border-outline/30 bg-surface p-4 text-center text-on-surface-variant shadow-xs"
			>
				未发现可用的课表导入插件
			</div>
		{/if}
	</div>
</div>
