<script lang="ts">
	import type { ReactiveChronosController } from '../../reactivity/engine-controller.svelte';
	import {
		AcademicCalendarService,
		computeTimetableWeekLayout,
		COURSE_PALETTE_ENTRIES,
		todayIsoDate
	} from '@chronos/core';
	import TimetablePreviewGrid from '../../timetable-preview/TimetablePreviewGrid.svelte';
	import TimetableWallpaperLayer from '../../timetable-preview/TimetableWallpaperLayer.svelte';

	interface Props {
		id?: string;
		label: string;
		description?: string;
		accept?: string;
		disabled?: boolean;
		required?: boolean;
		value?: unknown;
		controller?: ReactiveChronosController;
		onValueChange?: (val: unknown) => void;
	}

	let {
		id,
		label,
		description = '',
		accept = 'image/*',
		disabled = false,
		required = false,
		value = $bindable(),
		controller,
		onValueChange
	}: Props = $props();

	const instanceId = $props.id();
	const inputId = $derived(id || instanceId);

	const calendarService = new AcademicCalendarService();

	const timetable = $derived(controller?.currentTimetable ?? null);
	const today = $derived(todayIsoDate());
	const academicWeek = $derived(
		calendarService.calculateAcademicWeek(today, timetable?.academicConfig)
	);
	const displayedWeek = $derived(
		controller?.displayedWeek ?? controller?.activeWeek ?? academicWeek ?? 1
	);
	const isCurrentWeek = $derived(displayedWeek === (academicWeek ?? controller?.activeWeek ?? 1));
	const currentPeriodIndex = $derived(controller?.currentPeriodIndex ?? null);
	const coursePalette = $derived(
		controller?.coursePalette && controller.coursePalette.length > 0
			? controller.coursePalette
			: COURSE_PALETTE_ENTRIES
	);
	const paletteCourses = $derived(timetable?.courses ?? []);
	const layoutMode = $derived(controller?.userPreferences?.timetableLayoutMode ?? 'fixed');
	const capsuleCornerStyle = $derived(controller?.userPreferences?.capsuleCornerStyle ?? 'sharp');
	const courseBadges = $derived(controller?.courseBadges ?? {});
	const hostTranslate = $derived(
		controller ? (key: string) => controller.translatePlugin('host-ui', key) : (key: string) => key
	);

	const preview = $derived(
		timetable
			? computeTimetableWeekLayout({
					timetable,
					displayedWeek,
					todayIso: today,
					academicCalendarService: calendarService,
					coursePalette,
					paletteCourses,
					layoutMode,
					capsuleCornerStyle
				})
			: null
	);
	const gridModel = $derived(preview?.gridModel ?? null);
	const courseDisplayModels = $derived(preview?.courseDisplayModels ?? []);

	let selectedFileName = $state<string>('');
	let objectUrl = $state<string | null>(null);
	let prevObjectUrl: string | null = null;

	function dataUrlFromBytes(bytes: Uint8Array): string | null {
		try {
			const blob = new Blob([bytes as BlobPart]);
			return URL.createObjectURL(blob);
		} catch {
			return null;
		}
	}

	$effect(() => {
		const v = value;
		// cleanup previous
		if (prevObjectUrl) {
			URL.revokeObjectURL(prevObjectUrl);
			prevObjectUrl = null;
		}
		if (v instanceof Uint8Array && v.length > 0) {
			const url = dataUrlFromBytes(v);
			objectUrl = url;
			prevObjectUrl = url;
		} else if (typeof v === 'string' && v.startsWith('data:')) {
			objectUrl = v;
		} else {
			objectUrl = null;
		}
	});

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		selectedFileName = file.name;
		const buffer = await file.arrayBuffer();
		const bytes = new Uint8Array(buffer);
		value = bytes;
		onValueChange?.(bytes);
	}
</script>

<div class="flex flex-col gap-3 text-left">
	<label for={inputId} class="text-sm font-medium text-on-surface">
		{label}
		{#if required}<span class="ml-0.5 text-error">*</span>{/if}
	</label>
	{#if description}
		<span class="-mt-1 text-xs text-on-surface-variant">{description}</span>
	{/if}

	<div class="relative flex items-center">
		<input
			id={inputId}
			type="file"
			{accept}
			{disabled}
			{required}
			onchange={handleFileChange}
			class="w-full rounded-xl border border-outline/30 bg-surface-container px-3.5 py-2 text-sm text-on-surface file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-on-primary hover:file:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
		/>
	</div>
	{#if selectedFileName}
		<span class="text-xs text-primary">已选择: {selectedFileName}</span>
	{/if}

	<div class="overflow-hidden rounded-xl border border-outline/20">
		{#if timetable && gridModel}
			<div class="relative flex aspect-[9/16] max-h-[520px] w-full flex-col overflow-hidden">
				{#if objectUrl}
					<TimetableWallpaperLayer wallpaperUri={objectUrl}>
						<TimetablePreviewGrid
							{displayedWeek}
							{gridModel}
							{courseDisplayModels}
							{coursePalette}
							{paletteCourses}
							hasDynamicBackground={true}
							{layoutMode}
							{capsuleCornerStyle}
							{isCurrentWeek}
							{currentPeriodIndex}
							{courseBadges}
							{hostTranslate}
							interactive={false}
						/>
					</TimetableWallpaperLayer>
				{:else}
					<TimetablePreviewGrid
						{displayedWeek}
						{gridModel}
						{courseDisplayModels}
						{coursePalette}
						{paletteCourses}
						hasDynamicBackground={false}
						{layoutMode}
						{capsuleCornerStyle}
						{isCurrentWeek}
						{currentPeriodIndex}
						{courseBadges}
						{hostTranslate}
						interactive={false}
					/>
					<div
						class="absolute inset-x-0 bottom-0 bg-surface-variant/80 px-3 py-2 text-center backdrop-blur-sm"
					>
						<p class="text-body-small text-on-surface-variant">选择壁纸后可预览效果</p>
					</div>
				{/if}
			</div>
		{:else}
			<p
				class="text-body-medium flex items-center justify-center p-8 text-center text-on-surface-variant"
			>
				暂无课表，导入后可预览壁纸效果
			</p>
		{/if}
	</div>
</div>
