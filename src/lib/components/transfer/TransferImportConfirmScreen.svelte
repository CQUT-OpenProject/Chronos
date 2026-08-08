<script lang="ts">
	import { ImportMode } from '$lib/domain/import-mode';
	import {
		previewSourceLabel,
		type TransferStateController
	} from '$lib/transfer/transfer-state.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Radio from '$lib/components/ui/Radio.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { CalendarMonthFill, InfoFill, DownloadFill } from '$lib/icons';

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
	<div class="flex flex-col gap-6 py-1">
		<!-- MD3 Preview Summary Card -->
		<Card variant="filled" class="border border-outline-variant/50 !bg-surface-variant/30 p-4.5">
			<div class="flex flex-col gap-3.5">
				<div class="flex items-center justify-between gap-3">
					<h2 class="m3-title-medium flex-1 font-bold text-on-surface">
						{preview.name}
					</h2>
					<span
						class="inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container"
					>
						{previewSourceLabel(transferState.previewSource)}
					</span>
				</div>

				<div class="grid grid-cols-3 gap-2.5">
					<div
						class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
					>
						<span class="m3-body-small font-medium text-on-surface-variant">课程数</span>
						<span class="m3-title-large mt-0.5 font-bold text-on-surface"
							>{preview.courses.length}</span
						>
					</div>
					<div
						class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
					>
						<span class="m3-body-small font-medium text-on-surface-variant">开始周</span>
						<span class="m3-title-large mt-0.5 font-bold text-on-surface"
							>{preview.academicConfig.startWeek}</span
						>
					</div>
					<div
						class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
					>
						<span class="m3-body-small font-medium text-on-surface-variant">结束周</span>
						<span class="m3-title-large mt-0.5 font-bold text-on-surface"
							>{preview.academicConfig.endWeek}</span
						>
					</div>
				</div>
			</div>
		</Card>

		<!-- Import Mode Selection Section -->
		<div class="flex flex-col gap-3">
			<h3 class="m3-title-medium px-1 font-semibold text-on-surface">导入方式</h3>

			<div class="flex flex-col gap-2.5">
				<button
					type="button"
					class="flex min-h-[56px] w-full cursor-pointer items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-colors duration-200 {transferState.importMode ===
					ImportMode.AS_NEW
						? 'border-brand bg-primary-container/30 shadow-xs dark:border-soft-blue'
						: 'border-outline-variant/60 bg-surface hover:bg-surface-variant/30'}"
					onclick={() => transfer.setImportMode(ImportMode.AS_NEW)}
				>
					<Radio
						name="import-mode"
						checked={transferState.importMode === ImportMode.AS_NEW}
						onchange={() => transfer.setImportMode(ImportMode.AS_NEW)}
					/>
					<div class="flex flex-col justify-center">
						<span class="m3-body-large font-medium text-on-surface">作为新课程表导入</span>
					</div>
				</button>

				<button
					type="button"
					class="flex min-h-[56px] w-full cursor-pointer items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-colors duration-200 {transferState.importMode ===
					ImportMode.OVERWRITE_CURRENT
						? 'border-brand bg-primary-container/30 shadow-xs dark:border-soft-blue'
						: 'border-outline-variant/60 bg-surface hover:bg-surface-variant/30'}"
					onclick={() => transfer.setImportMode(ImportMode.OVERWRITE_CURRENT)}
				>
					<Radio
						name="import-mode"
						checked={transferState.importMode === ImportMode.OVERWRITE_CURRENT}
						onchange={() => transfer.setImportMode(ImportMode.OVERWRITE_CURRENT)}
					/>
					<div class="flex flex-col justify-center">
						<span class="m3-body-large font-medium text-on-surface">覆盖当前课程表</span>
						{#if currentTimetableName}
							<span class="m3-body-small mt-0.5 text-on-surface-variant">
								当前课程表：{currentTimetableName}
							</span>
						{/if}
					</div>
				</button>
			</div>
		</div>

		<!-- Date Input Section for HTML source -->
		{#if requiresTermStartDate}
			<Card variant="outlined" class="p-4">
				<div class="flex flex-col gap-3">
					<h3 class="m3-title-medium font-semibold text-on-surface">学期起始日期</h3>
					<div
						class="relative flex items-center rounded-xl border border-outline bg-surface px-3.5 py-2.5 text-on-surface transition-all focus-within:border-2 focus-within:border-brand"
					>
						<CalendarMonthFill class="mr-2.5 size-5 shrink-0 text-on-surface-variant" />
						<input
							type="date"
							class="m3-body-large w-full border-none bg-transparent p-0 text-on-surface outline-none focus:ring-0"
							value={transferState.htmlImportTermStartDate ?? ''}
							oninput={(event) =>
								transfer.setHtmlImportTermStartDate(
									(event.currentTarget as HTMLInputElement).value
								)}
						/>
					</div>
					<p class="m3-body-small flex items-center gap-1.5 text-on-surface-variant">
						<InfoFill class="size-4 shrink-0 text-on-surface-variant/80" />
						<span>HTML 导入需要指定本学期第一周的周一日期。</span>
					</p>
				</div>
			</Card>
		{/if}

		<!-- Action Button -->
		<div class="pt-2">
			<Button
				variant="filled"
				disabled={loading || (requiresTermStartDate && !transferState.htmlImportTermStartDate)}
				class="h-12 w-full text-base font-semibold shadow-xs"
				onclick={handleConfirm}
			>
				{#if loading}
					<span>导入中…</span>
				{:else}
					<DownloadFill class="size-5" />
					<span>
						{transferState.importMode === ImportMode.AS_NEW ? '导入为新课程表' : '覆盖当前课程表'}
					</span>
				{/if}
			</Button>
		</div>

		{#if transferState.errorMessage}
			<p class="m3-body-medium px-1 font-medium text-danger">{transferState.errorMessage}</p>
		{/if}
	</div>
{/if}
