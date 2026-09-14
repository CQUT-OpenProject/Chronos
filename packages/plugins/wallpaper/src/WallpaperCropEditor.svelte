<script lang="ts">
	import type { ChronosUiController } from '@chronos/ui-kit';
	import {
		AcademicCalendarService,
		computeTimetableWeekLayout,
		COURSE_PALETTE_ENTRIES
	} from '@chronos/core';
	import { TimetablePreviewGrid, pluginText } from '@chronos/ui-kit';
	import {
		clampTransform,
		computeCoverScale,
		exportCroppedImage,
		imageDisplaySize,
		imageTopLeft,
		loadImageFromSource,
		zoomAtPoint,
		type CropTransform
	} from './crop-image';
	import { WALLPAPER_MESSAGES } from './messages';
	import { WALLPAPER_PLUGIN_ID } from './storage';

	interface Props {
		controller: ChronosUiController;
		source: Blob | File;
		onConfirm: (blob: Blob) => void | Promise<void>;
		onCancel: () => void;
	}

	let { controller, source, onConfirm, onCancel }: Props = $props();

	function pt(key: keyof (typeof WALLPAPER_MESSAGES)['zh-cn']) {
		return pluginText(controller, WALLPAPER_PLUGIN_ID, WALLPAPER_MESSAGES, key);
	}

	const hint = $derived(pt('screen.crop.hint'));
	const cancelLabel = $derived(pt('screen.action.cancel'));
	const confirmLabel = $derived(pt('screen.action.confirmCrop'));

	const calendarService = new AcademicCalendarService();
	const hostTranslate = (key: string) => controller.translatePlugin('host-ui', key);

	const timetable = $derived(controller.currentTimetable);
	const today = $derived(controller.clockTodayIso);
	const academicWeek = $derived(
		timetable ? calendarService.calculateAcademicWeek(today, timetable.academicConfig) : null
	);
	const displayedWeek = $derived(controller.activeWeek ?? academicWeek ?? 1);
	const isCurrentWeek = $derived(displayedWeek === (academicWeek ?? controller.activeWeek ?? 1));
	const currentPeriodIndex = $derived(controller.currentPeriodIndex);
	const layoutMode = $derived(controller.userPreferences?.timetableLayoutMode ?? 'fixed');
	const capsuleCornerStyle = $derived(controller.userPreferences?.capsuleCornerStyle ?? 'sharp');
	const paletteCourses = $derived(timetable?.courses ?? []);
	const courseBadges = $derived(controller.courseBadges ?? {});

	const preview = $derived(
		timetable
			? computeTimetableWeekLayout({
					timetable,
					displayedWeek,
					todayIso: today,
					academicCalendarService: calendarService,
					coursePalette: COURSE_PALETTE_ENTRIES,
					paletteCourses,
					layoutMode,
					capsuleCornerStyle
				})
			: null
	);
	const gridModel = $derived(preview?.gridModel ?? null);
	const courseDisplayModels = $derived(preview?.courseDisplayModels ?? []);

	let viewportEl: HTMLDivElement | undefined = $state();
	let frameWidth = $state(0);
	let frameHeight = $state(0);
	let imageEl: HTMLImageElement | null = $state(null);
	let previewUrl = $state<string | null>(null);
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);
	let transform = $state<CropTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
	let confirming = $state(false);

	const minScale = $derived(
		naturalWidth > 0 && naturalHeight > 0 && frameWidth > 0 && frameHeight > 0
			? computeCoverScale(naturalWidth, naturalHeight, frameWidth, frameHeight)
			: 1
	);

	const displaySize = $derived(
		naturalWidth > 0 && naturalHeight > 0
			? imageDisplaySize(naturalWidth, naturalHeight, transform.scale)
			: { width: 0, height: 0 }
	);

	const imagePosition = $derived(
		frameWidth > 0 && frameHeight > 0 && naturalWidth > 0 && naturalHeight > 0
			? imageTopLeft(transform, naturalWidth, naturalHeight, frameWidth, frameHeight)
			: { left: 0, top: 0 }
	);

	let dragStart: { x: number; y: number; offsetX: number; offsetY: number } | null = null;
	const activePointers = new Map<number, { x: number; y: number }>();
	let pinchStartDistance = 0;
	let pinchStartScale = 1;
	let pinchAnchor = { x: 0, y: 0 };

	$effect(() => {
		const el = viewportEl;
		if (!el) return;

		const observer = new ResizeObserver(([entry]) => {
			const width = Math.round(entry.contentRect.width);
			const height = Math.round(entry.contentRect.height);
			if (width !== frameWidth || height !== frameHeight) {
				frameWidth = width;
				frameHeight = height;
				if (naturalWidth > 0 && naturalHeight > 0) {
					const coverScale = computeCoverScale(naturalWidth, naturalHeight, width, height);
					transform = clampTransform(
						{
							scale: Math.max(transform.scale, coverScale),
							offsetX: transform.offsetX,
							offsetY: transform.offsetY
						},
						naturalWidth,
						naturalHeight,
						width,
						height
					);
				}
			}
		});
		observer.observe(el);
		return () => observer.disconnect();
	});

	$effect(() => {
		const blob = source;
		let cancelled = false;
		let objectUrl: string | null = null;

		void (async () => {
			try {
				const image = await loadImageFromSource(blob);
				if (cancelled) return;
				objectUrl = URL.createObjectURL(blob);
				imageEl = image;
				previewUrl = objectUrl;
				naturalWidth = image.naturalWidth || image.width;
				naturalHeight = image.naturalHeight || image.height;
				const coverScale =
					frameWidth > 0 && frameHeight > 0
						? computeCoverScale(naturalWidth, naturalHeight, frameWidth, frameHeight)
						: 1;
				transform = { scale: coverScale, offsetX: 0, offsetY: 0 };
			} catch {
				onCancel();
			}
		})();

		return () => {
			cancelled = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
			previewUrl = null;
			imageEl = null;
		};
	});

	function applyTransform(next: CropTransform) {
		if (naturalWidth <= 0 || naturalHeight <= 0 || frameWidth <= 0 || frameHeight <= 0) return;
		transform = clampTransform(next, naturalWidth, naturalHeight, frameWidth, frameHeight);
	}

	function onPointerDown(event: PointerEvent) {
		if (confirming) return;
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);
		activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (activePointers.size === 1) {
			dragStart = {
				x: event.clientX,
				y: event.clientY,
				offsetX: transform.offsetX,
				offsetY: transform.offsetY
			};
		} else if (activePointers.size === 2) {
			const points = [...activePointers.values()];
			pinchStartDistance = distance(points[0], points[1]);
			pinchStartScale = transform.scale;
			const rect = viewportEl?.getBoundingClientRect();
			pinchAnchor = {
				x: (points[0].x + points[1].x) / 2 - (rect?.left ?? 0),
				y: (points[0].y + points[1].y) / 2 - (rect?.top ?? 0)
			};
			dragStart = null;
		}
	}

	function onPointerMove(event: PointerEvent) {
		if (confirming || !activePointers.has(event.pointerId)) return;
		activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

		if (activePointers.size >= 2) {
			const points = [...activePointers.values()];
			const nextDistance = distance(points[0], points[1]);
			if (pinchStartDistance <= 0) return;
			const ratio = nextDistance / pinchStartDistance;
			applyTransform(
				zoomAtPoint(
					transform,
					naturalWidth,
					naturalHeight,
					frameWidth,
					frameHeight,
					pinchAnchor.x,
					pinchAnchor.y,
					pinchStartScale * ratio,
					minScale
				)
			);
			return;
		}

		if (!dragStart) return;
		applyTransform({
			scale: transform.scale,
			offsetX: dragStart.offsetX + (event.clientX - dragStart.x),
			offsetY: dragStart.offsetY + (event.clientY - dragStart.y)
		});
	}

	function onPointerUp(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement;
		if (target.hasPointerCapture(event.pointerId)) {
			target.releasePointerCapture(event.pointerId);
		}
		activePointers.delete(event.pointerId);
		if (activePointers.size < 2) {
			pinchStartDistance = 0;
		}
		if (activePointers.size === 0) {
			dragStart = null;
		} else if (activePointers.size === 1) {
			const point = [...activePointers.values()][0];
			dragStart = {
				x: point.x,
				y: point.y,
				offsetX: transform.offsetX,
				offsetY: transform.offsetY
			};
		}
	}

	function onWheel(event: WheelEvent) {
		if (confirming) return;
		event.preventDefault();
		const rect = viewportEl?.getBoundingClientRect();
		if (!rect) return;
		const pointX = event.clientX - rect.left;
		const pointY = event.clientY - rect.top;
		const zoomFactor = event.deltaY < 0 ? 1.08 : 1 / 1.08;
		applyTransform(
			zoomAtPoint(
				transform,
				naturalWidth,
				naturalHeight,
				frameWidth,
				frameHeight,
				pointX,
				pointY,
				transform.scale * zoomFactor,
				minScale
			)
		);
	}

	async function confirmCrop() {
		if (!imageEl || frameWidth <= 0 || frameHeight <= 0 || confirming) return;
		confirming = true;
		try {
			const blob = await exportCroppedImage(
				imageEl,
				{ width: frameWidth, height: frameHeight },
				transform,
				{ sourceMime: source.type }
			);
			await onConfirm(blob);
		} finally {
			confirming = false;
		}
	}

	function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		return Math.hypot(dx, dy);
	}
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<div
		bind:this={viewportEl}
		class="relative min-h-0 flex-1 touch-none overflow-hidden bg-black select-none"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		onwheel={onWheel}
	>
		{#if previewUrl}
			<img
				src={previewUrl}
				alt=""
				draggable="false"
				class="pointer-events-none absolute max-w-none"
				style:left="{imagePosition.left}px"
				style:top="{imagePosition.top}px"
				style:width="{displaySize.width}px"
				style:height="{displaySize.height}px"
			/>
		{/if}

		{#if timetable && gridModel}
			<div class="pointer-events-none absolute inset-0">
				<TimetablePreviewGrid
					{displayedWeek}
					{gridModel}
					{courseDisplayModels}
					coursePalette={COURSE_PALETTE_ENTRIES}
					{paletteCourses}
					hasDynamicBackground={true}
					{layoutMode}
					{capsuleCornerStyle}
					interactive={false}
					{isCurrentWeek}
					{currentPeriodIndex}
					{courseBadges}
					{hostTranslate}
				/>
			</div>
		{/if}

		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pt-12 pb-3"
		>
			<p class="text-body-medium text-center text-white/90">{hint}</p>
		</div>
	</div>

	<div class="bottom-bar">
		<div class="mx-auto flex h-full w-full max-w-lg items-center gap-3">
			<button
				type="button"
				class="flex flex-1 items-center justify-center gap-2 rounded-full border border-outline bg-surface px-4 py-3 text-sm font-medium text-on-surface"
				disabled={confirming}
				onclick={onCancel}
			>
				{cancelLabel}
			</button>
			<button
				type="button"
				class="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-on-primary disabled:opacity-60"
				disabled={confirming || !imageEl || frameWidth <= 0}
				onclick={confirmCrop}
			>
				{confirmLabel}
			</button>
		</div>
	</div>
</div>
