<script lang="ts">
	import type { CourseDraft } from '$lib/models/drafts';
	import { COURSE_REMARK_MAX_LENGTH } from '@chronos/core';
	import {
		COURSE_PALETTE_ENTRIES,
		displaySwatchBackground,
		persistSwatchSelection,
		type CoursePaletteEntry
	} from '$lib/parsers/course-palette';
	import ColorSwatchPicker from '$lib/components/ui/ColorSwatchPicker.svelte';
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import StepperField from '$lib/components/ui/StepperField.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';

	let {
		draft = $bindable(),
		maxPeriods = 10,
		colors = COURSE_PALETTE_ENTRIES
	}: {
		draft: CourseDraft;
		maxPeriods?: number;
		colors?: readonly CoursePaletteEntry[];
	} = $props();

	const selectedBackground = $derived(displaySwatchBackground(draft.color, colors));

	function handleStartPeriodChange(value: number) {
		draft.endPeriod = Math.max(draft.endPeriod, value);
	}

	function selectColor(index: number) {
		const identity = persistSwatchSelection(index);
		draft.color = identity.background;
		draft.textColor = identity.foreground;
	}
</script>

<div class="space-y-4">
	<FormCard>
		<TextField label="课程名称" bind:value={draft.name} />
		<TextField label="教师" placeholder="选填" autocomplete="name" bind:value={draft.teacher} />
		<TextField
			label="地点"
			placeholder="选填"
			autocomplete="address-line1"
			bind:value={draft.location}
		/>
		<TextField
			label="备注"
			multiline
			rows={3}
			placeholder="选填"
			autocomplete="off"
			maxlength={COURSE_REMARK_MAX_LENGTH}
			bind:value={draft.remark}
		/>
	</FormCard>

	<FormCard>
		<StepperField label="星期" bind:value={draft.dayOfWeek} min={1} max={7} embedded />
		<StepperField
			label="开始节次"
			bind:value={draft.startPeriod}
			min={1}
			max={maxPeriods}
			embedded
			onchange={handleStartPeriodChange}
		/>
		<StepperField
			label="结束节次"
			bind:value={draft.endPeriod}
			min={draft.startPeriod}
			max={maxPeriods}
			embedded
		/>
	</FormCard>

	<ColorSwatchPicker {colors} {selectedBackground} onSelect={selectColor} />
</div>
