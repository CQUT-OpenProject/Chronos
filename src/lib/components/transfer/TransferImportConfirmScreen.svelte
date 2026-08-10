<script lang="ts">
	import { ImportMode } from '$lib/domain/import-mode';
	import {
		previewSourceLabel,
		type TransferStateController
	} from '$lib/transfer/transfer-state.svelte';
	import { DEFAULT_CQUT_CAMPUS_ID } from '$lib/models/cqut-campus';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import OnlineCampusPeriodSection from '$lib/components/timetable/OnlineCampusPeriodSection.svelte';
	import FormScreenLayout from '$lib/components/ui/FormScreenLayout.svelte';
	import SelectableOption from '$lib/components/ui/SelectableOption.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { InfoFill, DownloadFill } from '$lib/icons';
	import { countDistinctCourseNames } from '$lib/parsers/import-course-utils';

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
	const isHtmlImport = $derived(transferState.previewSource === 'HTML');
	const selectedCampus = $derived(transferState.htmlImportCampusId ?? DEFAULT_CQUT_CAMPUS_ID);
	const displayedCourseCount = $derived.by(() => {
		if (!preview) return 0;
		if (transferState.previewSource === 'ONLINE' || transferState.previewSource === 'HTML') {
			return countDistinctCourseNames(preview.courses);
		}
		return preview.courses.length;
	});
	let loading = $state(false);

	async function handleConfirm() {
		loading = true;
		try {
			const ok = await transfer.confirmImport();
			if (ok) {
				snackbar('导入成功');
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
				(isHtmlImport &&
					(!transferState.htmlImportTermStartDate || !transferState.htmlImportCampusId))}
			class="m3-body-large h-12 w-full shadow-xs"
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
							{previewSourceLabel(transferState.previewSource)}
						</span>
					</div>

					<div class="grid grid-cols-3 gap-2.5">
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="m3-body-small text-on-surface-variant">课程数</span>
							<span class="m3-title-large mt-0.5 font-bold text-on-surface"
								>{displayedCourseCount}</span
							>
						</div>
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="m3-body-small text-on-surface-variant">开始周</span>
							<span class="m3-title-large mt-0.5 font-bold text-on-surface"
								>{preview.academicConfig.startWeek}</span
							>
						</div>
						<div
							class="flex flex-col items-center justify-center rounded-2xl bg-surface/80 p-3 text-center transition-colors dark:bg-surface/50"
						>
							<span class="m3-body-small text-on-surface-variant">结束周</span>
							<span class="m3-title-large mt-0.5 font-bold text-on-surface"
								>{preview.academicConfig.endWeek}</span
							>
						</div>
					</div>
				</div>
			</Card>

			<div class="flex flex-col gap-3">
				<h3 class="m3-title-medium px-1 text-on-surface">导入方式</h3>

				<div class="flex flex-col gap-2.5">
					<SelectableOption
						name="import-mode"
						label="作为新课程表导入"
						selected={transferState.importMode === ImportMode.AS_NEW}
						onclick={() => transfer.setImportMode(ImportMode.AS_NEW)}
					/>

					<SelectableOption
						name="import-mode"
						label="覆盖当前课程表"
						description={currentTimetableName ? `当前课程表：${currentTimetableName}` : undefined}
						selected={transferState.importMode === ImportMode.OVERWRITE_CURRENT}
						onclick={() => transfer.setImportMode(ImportMode.OVERWRITE_CURRENT)}
					/>
				</div>
			</div>

			{#if isHtmlImport}
				<OnlineCampusPeriodSection
					{selectedCampus}
					onSelectCampus={(campusId) => transfer.setHtmlImportCampusId(campusId)}
				/>

				<Card variant="outlined" class="p-4">
					<div class="flex flex-col gap-3">
						<TextField
							label="学期起始日期"
							type="date"
							value={transferState.htmlImportTermStartDate ?? ''}
							onValueChange={(value) => transfer.setHtmlImportTermStartDate(value)}
						/>
						<p class="m3-body-small flex items-center gap-1.5 text-on-surface-variant">
							<InfoFill class="size-4 shrink-0 text-on-surface-variant/80" />
							<span>HTML 导入需要指定本学期第一周的周一日期。</span>
						</p>
					</div>
				</Card>
			{/if}
		</div>
	</FormScreenLayout>
{/if}
