<script lang="ts">
	import { isChronosMountable } from '@chronos/core';
	import { trackEvent } from '$lib/client/analytics';
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { buildImportDescription } from '$lib/transfer/import-slot-capabilities';
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

	const isMountable = $derived(isChronosMountable(activeSlot?.component));
	let mountableContainerEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!mountableContainerEl || !activeSlot?.component || !isMountable) return;
		const comp = activeSlot.component;
		let instance: { unmount?(): void } | (() => void) | undefined;
		try {
			instance = comp.mount(mountableContainerEl, { controller, transfer, onContinue });
		} catch (error) {
			console.error('[TransferImportScreen] mount failed:', error);
			return;
		}
		return () => {
			try {
				if (typeof instance === 'function') {
					instance();
				} else if (typeof instance?.unmount === 'function') {
					instance.unmount();
				}
			} catch (error) {
				console.error('[TransferImportScreen] unmount failed:', error);
			}
		};
	});

	const importDescription = $derived(buildImportDescription(availableSlots));

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
		{#if importSegments.length <= 3}
			<SegmentedControl
				segments={importSegments}
				value={transfer.state.selectedSlotId}
				onValueChange={handleSourceChange}
			/>
		{:else}
			<div class="flex w-full gap-2 overflow-x-auto pb-1">
				{#each availableSlots as slot (slot.id)}
					{@const title = typeof slot.title === 'function' ? slot.title() : slot.title}
					{@const badge = typeof slot.badge === 'function' ? slot.badge() : slot.badge}
					{@const isSelected = transfer.state.selectedSlotId === slot.id}
					<button
						type="button"
						class="m3-label-large relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-center transition-colors {isSelected
							? 'bg-secondary-container font-medium text-on-secondary-container shadow-xs'
							: 'bg-surface-variant/40 text-on-surface-variant hover:bg-surface-variant/70 hover:text-on-surface'}"
						onclick={() => handleSourceChange(slot.id)}
					>
						<span>{title}</span>
						{#if badge}
							<span
								class="m3-label-small rounded-full px-1.5 py-0.5 text-[10px] leading-none {isSelected
									? 'bg-primary text-on-primary'
									: 'bg-outline-variant text-on-surface-variant'}"
							>
								{badge}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	{/if}

	<div class="w-full">
		{#if activeSlot?.component}
			{#if isMountable}
				<div bind:this={mountableContainerEl} class="w-full"></div>
			{:else}
				{@const DynamicComponent = activeSlot.component as import('svelte').Component<{
					controller?: typeof controller;
					transfer: typeof transfer;
					onContinue: () => void;
				}>}
				<DynamicComponent {controller} {transfer} {onContinue} />
			{/if}
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
