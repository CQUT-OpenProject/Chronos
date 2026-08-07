<script lang="ts">
	import { ImportMode } from '$lib/domain/import-mode';
	import {
		previewSourceLabel,
		type TransferStateController
	} from '$lib/transfer/transfer-state.svelte';
	import { Button, RadioAnim1 } from 'm3-svelte';

	let {
		transfer,
		currentTimetableName,
		onConfirm
	}: {
		transfer: TransferStateController;
		currentTimetableName: string | null;
		onConfirm: () => void;
	} = $props();

	const transferState = $derived(transfer.state);
	const preview = $derived(transferState.preview);
	const requiresTermStartDate = $derived(transferState.previewSource === 'HTML');
	let loading = $state(false);

	async function handleConfirm() {
		loading = true;
		try {
			const ok = await transfer.confirmImport();
			if (ok) onConfirm();
		} finally {
			loading = false;
		}
	}
</script>

{#if preview}
	<div class="m3-stack">
		<p class="m3-body-medium text-on-surface-variant">课表已准备好，请选择导入方式：</p>

		<!-- PreviewSummaryCard matching Android -->
		<div
			class="flex flex-col gap-2.5 rounded-[20px] border border-outline-variant bg-primary-container/35 p-3.5"
		>
			<div class="flex items-center justify-between gap-2">
				<span class="m3-title-medium flex-1 font-semibold text-on-surface">{preview.name}</span>
				<span
					class="rounded-full bg-brand/12 px-2.5 py-1 text-xs font-medium text-brand dark:bg-soft-blue/15 dark:text-soft-blue"
				>
					{previewSourceLabel(transferState.previewSource)}
				</span>
			</div>
			<div class="grid grid-cols-3 gap-2">
				<div
					class="flex flex-col gap-0.5 rounded-2xl border border-outline-variant bg-surface p-2.5"
				>
					<span class="text-[11px] text-on-surface-variant">课程数</span>
					<span class="text-sm font-semibold text-on-surface">{preview.courses.length}</span>
				</div>
				<div
					class="flex flex-col gap-0.5 rounded-2xl border border-outline-variant bg-surface p-2.5"
				>
					<span class="text-[11px] text-on-surface-variant">开始周</span>
					<span class="text-sm font-semibold text-on-surface"
						>{preview.academicConfig.startWeek}</span
					>
				</div>
				<div
					class="flex flex-col gap-0.5 rounded-2xl border border-outline-variant bg-surface p-2.5"
				>
					<span class="text-[11px] text-on-surface-variant">结束周</span>
					<span class="text-sm font-semibold text-on-surface">{preview.academicConfig.endWeek}</span
					>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-2.5">
			<h3 class="m3-title-medium text-on-surface">导入方式</h3>
			<button
				type="button"
				class="flex w-full cursor-pointer items-center gap-3 rounded-[20px] border bg-surface p-[12px_16px] text-left transition-colors {transferState.importMode ===
				ImportMode.AS_NEW
					? 'border-brand shadow-xs dark:border-soft-blue'
					: 'border-outline-variant hover:bg-surface-variant/30'}"
				onclick={() => transfer.setImportMode(ImportMode.AS_NEW)}
			>
				<RadioAnim1>
					<input
						type="radio"
						name="import-mode"
						checked={transferState.importMode === ImportMode.AS_NEW}
					/>
				</RadioAnim1>
				<span class="m3-body-large text-on-surface">作为新课程表导入</span>
			</button>

			<button
				type="button"
				class="flex w-full cursor-pointer items-center gap-3 rounded-[20px] border bg-surface p-[12px_16px] text-left transition-colors {transferState.importMode ===
				ImportMode.OVERWRITE_CURRENT
					? 'border-brand shadow-xs dark:border-soft-blue'
					: 'border-outline-variant hover:bg-surface-variant/30'}"
				onclick={() => transfer.setImportMode(ImportMode.OVERWRITE_CURRENT)}
			>
				<RadioAnim1>
					<input
						type="radio"
						name="import-mode"
						checked={transferState.importMode === ImportMode.OVERWRITE_CURRENT}
					/>
				</RadioAnim1>
				<span class="m3-body-large text-on-surface">
					覆盖当前课程表{currentTimetableName ? `（${currentTimetableName}）` : ''}
				</span>
			</button>
		</div>

		{#if requiresTermStartDate}
			<div class="flex flex-col gap-2 rounded-[20px] border border-outline-variant bg-surface p-4">
				<h3 class="m3-title-medium">学期起始日期</h3>
				<input
					type="date"
					class="m3-body-large rounded-md border border-outline bg-surface px-3 py-2.5 text-on-surface"
					value={transferState.htmlImportTermStartDate ?? ''}
					oninput={(event) =>
						transfer.setHtmlImportTermStartDate((event.currentTarget as HTMLInputElement).value)}
				/>
				<p class="m3-body-small text-on-surface-variant">
					HTML 导入需要指定本学期第一周的周一日期。
				</p>
			</div>
		{/if}

		<Button
			variant="filled"
			disabled={loading || (requiresTermStartDate && !transferState.htmlImportTermStartDate)}
			class="w-full"
			onclick={handleConfirm}
		>
			{loading
				? '导入中…'
				: transferState.importMode === ImportMode.AS_NEW
					? '导入为新课程表'
					: '覆盖当前课程表'}
		</Button>

		{#if transferState.errorMessage}
			<p class="m3-body-medium text-danger">{transferState.errorMessage}</p>
		{/if}
	</div>
{/if}
