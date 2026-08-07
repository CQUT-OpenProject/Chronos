<script lang="ts">
	import type { CourseDraft } from '$lib/models/drafts';

	const COURSE_COLORS: Array<{ background: string; foreground: string }> = [
		{ background: '#EADDFF', foreground: '#21005D' },
		{ background: '#FFDBC9', foreground: '#311100' },
		{ background: '#C4EED0', foreground: '#072711' },
		{ background: '#F9DEDC', foreground: '#410E0B' },
		{ background: '#D3E3FD', foreground: '#041E49' },
		{ background: '#FFD8E4', foreground: '#31111D' }
	];

	let {
		draft = $bindable(),
		maxPeriods = 10,
		onSave,
		onDelete
	}: {
		draft: CourseDraft;
		maxPeriods?: number;
		onSave: () => void | Promise<void>;
		onDelete?: () => void | Promise<void>;
	} = $props();

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	function stepValue(field: 'dayOfWeek' | 'startPeriod' | 'endPeriod', delta: number) {
		if (field === 'dayOfWeek') {
			draft.dayOfWeek = clamp(draft.dayOfWeek + delta, 1, 7);
			return;
		}
		if (field === 'startPeriod') {
			draft.startPeriod = clamp(draft.startPeriod + delta, 1, maxPeriods);
			draft.endPeriod = Math.max(draft.endPeriod, draft.startPeriod);
			return;
		}
		draft.endPeriod = clamp(draft.endPeriod + delta, draft.startPeriod, maxPeriods);
	}

	function selectColor(background: string, foreground: string) {
		draft.color = background;
		draft.textColor = foreground;
	}
</script>

<div class="space-y-3">
	<label class="block space-y-1">
		<span class="text-sm text-on-surface-variant">课程名称</span>
		<input
			class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant dark:bg-surface-variant"
			bind:value={draft.name}
		/>
	</label>

	<label class="block space-y-1">
		<span class="text-sm text-on-surface-variant">教师</span>
		<input
			class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant dark:bg-surface-variant"
			bind:value={draft.teacher}
		/>
	</label>

	<label class="block space-y-1">
		<span class="text-sm text-on-surface-variant">地点</span>
		<input
			class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant dark:bg-surface-variant"
			bind:value={draft.location}
		/>
	</label>

	<label class="block space-y-1">
		<span class="text-sm text-on-surface-variant">备注</span>
		<textarea
			class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant dark:bg-surface-variant"
			rows="3"
			bind:value={draft.remark}></textarea>
	</label>

	<div
		class="flex items-center justify-between rounded-lg border border-outline px-3 py-2 dark:border-outline-variant"
	>
		<span class="text-sm">星期</span>
		<div class="flex items-center gap-2">
			<button type="button" class="px-2" onclick={() => stepValue('dayOfWeek', -1)}>-</button>
			<span>{draft.dayOfWeek}</span>
			<button type="button" class="px-2" onclick={() => stepValue('dayOfWeek', 1)}>+</button>
		</div>
	</div>

	<div
		class="flex items-center justify-between rounded-lg border border-outline px-3 py-2 dark:border-outline-variant"
	>
		<span class="text-sm">开始节次</span>
		<div class="flex items-center gap-2">
			<button type="button" class="px-2" onclick={() => stepValue('startPeriod', -1)}>-</button>
			<span>{draft.startPeriod}</span>
			<button type="button" class="px-2" onclick={() => stepValue('startPeriod', 1)}>+</button>
		</div>
	</div>

	<div
		class="flex items-center justify-between rounded-lg border border-outline px-3 py-2 dark:border-outline-variant"
	>
		<span class="text-sm">结束节次</span>
		<div class="flex items-center gap-2">
			<button type="button" class="px-2" onclick={() => stepValue('endPeriod', -1)}>-</button>
			<span>{draft.endPeriod}</span>
			<button type="button" class="px-2" onclick={() => stepValue('endPeriod', 1)}>+</button>
		</div>
	</div>

	<div class="space-y-2">
		<span class="text-sm text-on-surface-variant">课程颜色</span>
		<div class="flex flex-wrap gap-2">
			{#each COURSE_COLORS as color (color.background)}
				<button
					type="button"
					class="h-[34px] w-[34px] rounded-[32px] border-2 {draft.color === color.background
						? 'border-brand dark:border-soft-blue'
						: 'border-transparent'}"
					style:background-color={color.background}
					aria-label="选择课程颜色"
					onclick={() => selectColor(color.background, color.foreground)}
				></button>
			{/each}
		</div>
	</div>

	{#if onDelete}
		<button
			type="button"
			class="w-full rounded-lg border border-danger px-3 py-2 text-sm text-danger"
			onclick={() => onDelete()}
		>
			删除课程
		</button>
	{/if}
</div>
