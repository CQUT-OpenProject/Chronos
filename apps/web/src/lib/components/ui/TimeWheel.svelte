<script lang="ts">
	import { haptic } from '$lib/haptic/haptic';
	import { hourItems, minuteItems, type TimePickerLabels, type TimeValue } from '@chronos/ui-kit';

	const ROW_HEIGHT = 40;

	let {
		value = $bindable({ hour: 0, minute: 0 }),
		label,
		labels,
		idPrefix,
		disabled = false
	}: {
		value?: TimeValue;
		label: string;
		labels: TimePickerLabels;
		idPrefix: string;
		disabled?: boolean;
	} = $props();

	const hours = hourItems();
	const minutes = minuteItems();
	const wheelNodes: Record<'hour' | 'minute', HTMLElement | null> = { hour: null, minute: null };

	let suppressTickUntil = 0;
	let lastTickAt = 0;
	let settleTimer = 0;
	// Latest snapped indices seen during a gesture. Plain (non-reactive) on purpose:
	// writing DOM-bound state mid-fling aborts platform momentum scrolling.
	const liveIndex: Record<'hour' | 'minute', number> = { hour: 0, minute: 0 };

	function pad(n: number): string {
		return String(n).padStart(2, '0');
	}

	function scrollColumn(kind: 'hour' | 'minute', index: number, smooth: boolean) {
		const node = wheelNodes[kind];
		if (!node) return;
		node.scrollTo({
			top: index * ROW_HEIGHT,
			behavior: (smooth ? 'smooth' : 'instant') as ScrollBehavior
		});
	}

	export function scrollToValue() {
		suppressTickUntil = Date.now() + 150;
		liveIndex.hour = value.hour;
		liveIndex.minute = value.minute;
		scrollColumn('hour', value.hour, false);
		scrollColumn('minute', value.minute, false);
	}

	function fireTick() {
		const now = Date.now();
		if (now < suppressTickUntil || now - lastTickAt < 40) return;
		lastTickAt = now;
		haptic.medium();
	}

	function handleWheelScroll(kind: 'hour' | 'minute', node: HTMLElement) {
		// Fast path only: track the snapped index and vibrate. No reactive writes
		// here — mutating the subtree mid-gesture kills fling momentum on iOS.
		const max = kind === 'hour' ? hours.length - 1 : minutes.length - 1;
		const index = Math.min(Math.max(Math.round(node.scrollTop / ROW_HEIGHT), 0), max);
		if (liveIndex[kind] !== index) {
			liveIndex[kind] = index;
			fireTick();
		}
		window.clearTimeout(settleTimer);
		settleTimer = window.setTimeout(settleDraft, 90);
	}

	function settleDraft() {
		settleTimer = 0;
		if (liveIndex.hour === value.hour && liveIndex.minute === value.minute) return;
		value = { hour: liveIndex.hour, minute: liveIndex.minute };
	}

	function pick(kind: 'hour' | 'minute', index: number) {
		const max = kind === 'hour' ? hours.length - 1 : minutes.length - 1;
		const clamped = Math.min(Math.max(index, 0), max);
		// Optimistic single write: no fling in progress, so this cannot abort momentum.
		value = kind === 'hour' ? { ...value, hour: clamped } : { ...value, minute: clamped };
		liveIndex[kind] = clamped;
		scrollColumn(kind, clamped, true);
	}

	function handleWheelKeydown(kind: 'hour' | 'minute', event: KeyboardEvent) {
		// Base on the latest gesture truth, not the last settled value:
		// value can lag liveIndex while a fling is still settling.
		const current = liveIndex[kind];
		if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
			event.preventDefault();
			pick(kind, current + 1);
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
			event.preventDefault();
			pick(kind, current - 1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			pick(kind, 0);
		} else if (event.key === 'End') {
			event.preventDefault();
			pick(kind, kind === 'hour' ? 23 : 59);
		}
	}

	function wheelAttach(node: HTMLElement, kind: 'hour' | 'minute') {
		wheelNodes[kind] = node;
		// Sync the gesture truth on mount: scrollToValue() runs a tick after
		// the sheet opens and can be skipped if mounting lags, which would
		// otherwise leave the untouched column at 0 on the next settle.
		const max = kind === 'hour' ? hours.length - 1 : minutes.length - 1;
		liveIndex[kind] = Math.min(Math.max(value[kind], 0), max);
		node.scrollTo({ top: value[kind] * ROW_HEIGHT });
		return () => {
			if (wheelNodes[kind] === node) wheelNodes[kind] = null;
		};
	}
</script>

<div class="flex justify-center gap-3">
	{#each [{ kind: 'hour', items: hours, current: value.hour, name: labels.hour } as const, { kind: 'minute', items: minutes, current: value.minute, name: labels.minute } as const] as column (column.kind)}
		<div class="flex min-w-0 flex-1 flex-col items-center">
			<div class="relative w-full">
				<div
					role="listbox"
					aria-label={labels.columnAria(label, column.name)}
					tabindex={disabled ? -1 : 0}
					class="time-wheel h-[200px] overflow-y-auto rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
					style:padding-block="80px"
					{@attach (node) => wheelAttach(node, column.kind)}
					onscroll={(event) => handleWheelScroll(column.kind, event.currentTarget)}
					onscrollend={() => {
						window.clearTimeout(settleTimer);
						settleTimer = 0;
						settleDraft();
					}}
					onkeydown={(event) => handleWheelKeydown(column.kind, event)}
				>
					{#each column.items as n}
						<div
							role="option"
							id="{idPrefix}-{column.kind}-{n}"
							aria-selected={n === column.current}
							class="time-wheel-row text-body-large flex cursor-pointer items-center justify-center tabular-nums transition-colors {n ===
							column.current
								? 'font-medium text-on-surface'
								: 'text-on-surface-variant/60'}"
							style:height="{ROW_HEIGHT}px"
							onclick={() => pick(column.kind, n)}
						>
							{pad(n)}
						</div>
					{/each}
				</div>
				<div
					aria-hidden="true"
					class="pointer-events-none absolute inset-x-0 top-0 h-[80px] bg-gradient-to-b from-surface-container-high to-transparent"
				></div>
				<div
					aria-hidden="true"
					class="pointer-events-none absolute inset-x-0 bottom-0 h-[80px] bg-gradient-to-t from-surface-container-high to-transparent"
				></div>
				<div
					aria-hidden="true"
					class="pointer-events-none absolute inset-x-2 top-1/2 h-10 -translate-y-1/2 rounded-lg border-y border-outline-variant/40 bg-brand/5"
				></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.time-wheel {
		scroll-snap-type: y mandatory;
		scrollbar-width: none;
		touch-action: pan-y;
		overscroll-behavior-y: contain;
		-webkit-overflow-scrolling: touch;
	}
	.time-wheel::-webkit-scrollbar {
		display: none;
	}
	.time-wheel-row {
		scroll-snap-align: center;
	}
</style>
