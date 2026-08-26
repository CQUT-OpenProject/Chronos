<script lang="ts">
	import { SelectableOption as UiSelectableOption } from '@chronos/ui-kit';

	let {
		name,
		selected,
		disabled = false,
		onclick,
		label,
		description
	}: {
		name: string;
		selected: boolean;
		disabled?: boolean;
		onclick: () => void;
		label: string;
		description?: string;
	} = $props();
</script>

<UiSelectableOption {name} {selected} {disabled} {onclick} {label} {description} />
