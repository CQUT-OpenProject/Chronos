<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { CourseDraft } from '$lib/models/drafts';
	import { COURSE_REMARK_MAX_LENGTH } from '@chronos/core';
	import {
		COURSE_PALETTE_ENTRIES,
		displaySwatchBackground,
		persistSwatchSelection,
		type CoursePaletteEntry
	} from '@chronos/core';
	import ColorSwatchPicker from '$lib/components/ui/ColorSwatchPicker.svelte';
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import StepperField from '$lib/components/ui/StepperField.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import { getAppController } from '$lib/services/app-engine';

	let {
		draft = $bindable(),
		maxPeriods = 10,
		colors = COURSE_PALETTE_ENTRIES
	}: {
		draft: CourseDraft;
		maxPeriods?: number;
		colors?: readonly CoursePaletteEntry[];
	} = $props();

	const controller = getAppController();
	const optionalPlaceholder = $derived(hostT('course.form.optional'));

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
		<TextField label={hostT('course.form.name')} bind:value={draft.name} />
		<TextField
			label={hostT('course.form.teacher')}
			placeholder={optionalPlaceholder}
			autocomplete="name"
			bind:value={draft.teacher}
		/>
		<TextField
			label={hostT('course.form.location')}
			placeholder={optionalPlaceholder}
			autocomplete="address-line1"
			bind:value={draft.location}
		/>
		<TextField
			label={hostT('course.form.remark')}
			multiline
			rows={3}
			placeholder={optionalPlaceholder}
			autocomplete="off"
			maxlength={COURSE_REMARK_MAX_LENGTH}
			bind:value={draft.remark}
		/>
	</FormCard>

	<FormCard>
		<StepperField
			label={hostT('course.form.dayOfWeek')}
			bind:value={draft.dayOfWeek}
			min={1}
			max={7}
			embedded
		/>
		<StepperField
			label={hostT('course.form.startPeriod')}
			bind:value={draft.startPeriod}
			min={1}
			max={maxPeriods}
			embedded
			onchange={handleStartPeriodChange}
		/>
		<StepperField
			label={hostT('course.form.endPeriod')}
			bind:value={draft.endPeriod}
			min={draft.startPeriod}
			max={maxPeriods}
			embedded
		/>
	</FormCard>

	<ColorSwatchPicker {colors} {selectedBackground} onSelect={selectColor} />
</div>
