<script lang="ts">
	import type { CourseDraft } from '$lib/models/drafts';
	import { COURSE_PALETTE_ENTRIES } from '$lib/parsers/course-palette';
	import ColorSwatchPicker from '$lib/components/ui/ColorSwatchPicker.svelte';
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import StepperField from '$lib/components/ui/StepperField.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';

	let {
		draft = $bindable(),
		maxPeriods = 10
	}: {
		draft: CourseDraft;
		maxPeriods?: number;
	} = $props();

	function handleStartPeriodChange(value: number) {
		draft.endPeriod = Math.max(draft.endPeriod, value);
	}

	function selectColor(background: string, foreground: string) {
		draft.color = background;
		draft.textColor = foreground;
	}
</script>

<div class="space-y-4">
	<FormCard>
		<TextField label="课程名称" bind:value={draft.name} />
		<TextField label="教师" bind:value={draft.teacher} />
		<TextField label="地点" bind:value={draft.location} />
		<TextField label="备注" multiline rows={3} bind:value={draft.remark} />
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

	<ColorSwatchPicker
		colors={COURSE_PALETTE_ENTRIES}
		selectedBackground={draft.color}
		onSelect={selectColor}
	/>
</div>
