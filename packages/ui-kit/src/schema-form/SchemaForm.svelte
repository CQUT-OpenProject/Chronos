<script lang="ts">
	import type { ConfigSchema, SchemaField } from '@chronos/core';
	import { resolveLocalizedText } from '@chronos/core';
	import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';
	import TextField from './inputs/TextField.svelte';
	import Checkbox from './inputs/Checkbox.svelte';
	import SelectField from './inputs/SelectField.svelte';
	import FileField from './inputs/FileField.svelte';
	import TimetablePreviewField from './inputs/TimetablePreviewField.svelte';
	import WallpaperPreviewField from './inputs/WallpaperPreviewField.svelte';

	interface Props {
		schema: ConfigSchema<Record<string, unknown>>;
		value?: Record<string, unknown>;
		disabled?: boolean;
		controller?: ReactiveChronosController;
		onValueChange?: (value: Record<string, unknown>) => void;
	}

	let {
		schema,
		value = $bindable(),
		disabled = false,
		controller,
		onValueChange
	}: Props = $props();

	const entries = $derived(Object.entries(schema) as Array<[string, SchemaField<unknown>]>);
	const resolvedValue = $derived(value ?? {});

	function updateField(key: string, nextValue: unknown) {
		const next = {
			...resolvedValue,
			[key]: nextValue
		};
		value = next;
		onValueChange?.(next);
	}
</script>

<div class="flex flex-col gap-4">
	{#each entries as [key, field] (key)}
		{#if !field.hidden}
			{#if field.type === 'string'}
				<TextField
					id="field-{key}"
					label={resolveLocalizedText(field.title)}
					placeholder={resolveLocalizedText(field.placeholder)}
					description={resolveLocalizedText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key] as string}
					oninput={(e) => updateField(key, e.currentTarget.value)}
				/>
			{:else if field.type === 'password'}
				<TextField
					id="field-{key}"
					type="password"
					label={resolveLocalizedText(field.title)}
					placeholder={resolveLocalizedText(field.placeholder)}
					description={resolveLocalizedText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key] as string}
					oninput={(e) => updateField(key, e.currentTarget.value)}
				/>
			{:else if field.type === 'number'}
				<TextField
					id="field-{key}"
					type="number"
					label={resolveLocalizedText(field.title)}
					placeholder={resolveLocalizedText(field.placeholder)}
					description={resolveLocalizedText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key] as number}
					oninput={(e) => updateField(key, Number(e.currentTarget.value))}
				/>
			{:else if field.type === 'boolean'}
				<Checkbox
					id="field-{key}"
					label={resolveLocalizedText(field.title)}
					description={resolveLocalizedText(field.description)}
					{disabled}
					checked={Boolean(resolvedValue[key])}
					onchange={(e) => updateField(key, e.currentTarget.checked)}
				/>
			{:else if field.type === 'select'}
				<SelectField
					id="field-{key}"
					label={resolveLocalizedText(field.title)}
					description={resolveLocalizedText(field.description)}
					required={field.required}
					options={(field.options || []).map((opt) => ({
						label: resolveLocalizedText(opt.label),
						value: opt.value
					}))}
					{disabled}
					value={resolvedValue[key] as string | number}
					onchange={(e) => updateField(key, e.currentTarget.value)}
				/>
			{:else if field.type === 'file'}
				<FileField
					id="field-{key}"
					label={resolveLocalizedText(field.title)}
					accept={field.accept}
					description={resolveLocalizedText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key]}
					onValueChange={(val) => updateField(key, val)}
				/>
			{:else if field.type === 'date'}
				<TextField
					id="field-{key}"
					type="date"
					label={resolveLocalizedText(field.title)}
					placeholder={resolveLocalizedText(field.placeholder)}
					description={resolveLocalizedText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key] as string}
					oninput={(e) => updateField(key, e.currentTarget.value)}
				/>
			{:else if field.type === 'timetable-preview'}
				<TimetablePreviewField
					{controller}
					label={resolveLocalizedText(field.title)}
					description={resolveLocalizedText(field.description)}
				/>
			{:else if field.type === 'wallpaper-preview'}
				<WallpaperPreviewField
					id="field-{key}"
					label={resolveLocalizedText(field.title)}
					description={resolveLocalizedText(field.description)}
					accept={field.accept}
					required={field.required}
					{disabled}
					value={resolvedValue[key]}
					{controller}
					onValueChange={(val) => updateField(key, val)}
				/>
			{/if}
		{/if}
	{/each}
</div>
