<script lang="ts">
	import { ImportMode } from '$lib/domain/import-mode';
	import { TimetableImportSource } from '$lib/models/timetable';
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';

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
	const requiresTermStartDate = $derived(
		transferState.previewSource === 'HTML' ||
			preview?.importMetadata.source === TimetableImportSource.FILE_HTML
	);
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
	<div class="space-y-6 p-4">
		<div>
			<h1 class="text-xl font-semibold">确认导入</h1>
			<p class="mt-1 text-sm text-zinc-500">检查预览信息并选择导入方式。</p>
		</div>

		<section class="rounded-xl border border-zinc-200 p-4">
			<h2 class="text-lg font-semibold">{preview.name}</h2>
			<p class="mt-1 text-sm text-zinc-500">{preview.courses.length} 门课程</p>
		</section>

		<section class="space-y-2">
			<h3 class="font-medium">导入方式</h3>
			<label class="flex items-center gap-2">
				<input
					type="radio"
					name="import-mode"
					checked={transferState.importMode === ImportMode.AS_NEW}
					onchange={() => transfer.setImportMode(ImportMode.AS_NEW)}
				/>
				<span>作为新课表导入</span>
			</label>
			<label class="flex items-center gap-2">
				<input
					type="radio"
					name="import-mode"
					checked={transferState.importMode === ImportMode.OVERWRITE_CURRENT}
					onchange={() => transfer.setImportMode(ImportMode.OVERWRITE_CURRENT)}
				/>
				<span>覆盖当前课表{currentTimetableName ? `（${currentTimetableName}）` : ''}</span>
			</label>
		</section>

		{#if requiresTermStartDate}
			<section class="space-y-2">
				<h3 class="font-medium">学期起始日期</h3>
				<input
					type="date"
					class="rounded-lg border border-zinc-300 px-3 py-2"
					value={transferState.htmlImportTermStartDate ?? ''}
					oninput={(event) =>
						transfer.setHtmlImportTermStartDate((event.currentTarget as HTMLInputElement).value)}
				/>
				<p class="text-xs text-zinc-500">HTML 导入需要指定本学期第一周的周一日期。</p>
			</section>
		{/if}

		<button
			type="button"
			class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
			disabled={loading || (requiresTermStartDate && !transferState.htmlImportTermStartDate)}
			onclick={handleConfirm}
		>
			{loading ? '导入中…' : '确认导入'}
		</button>

		{#if transferState.errorMessage}
			<p class="text-sm text-red-600">{transferState.errorMessage}</p>
		{/if}
	</div>
{/if}
