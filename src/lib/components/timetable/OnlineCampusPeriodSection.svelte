<script lang="ts">
	import { CQUT_CAMPUSES, type CqutCampusName } from '$lib/models/cqut-campus';
	import Radio from '$lib/components/ui/Radio.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';

	let {
		selectedCampus,
		missingCampusMessage = null,
		onSelectCampus
	}: {
		selectedCampus: CqutCampusName;
		missingCampusMessage?: string | null;
		onSelectCampus: (campusName: CqutCampusName) => void;
	} = $props();
</script>

<MineSection title="节次时间">
	{#each CQUT_CAMPUSES as campus (campus)}
		{@const selected = selectedCampus === campus}
		<MineRow label title={campus} onclick={() => onSelectCampus(campus)}>
			{#snippet trailing()}
				<Radio name="cqut-campus" checked={selected} onchange={() => onSelectCampus(campus)} />
			{/snippet}
		</MineRow>
	{/each}
</MineSection>

{#if missingCampusMessage}
	<p class="px-1 text-sm text-on-surface-variant">{missingCampusMessage}</p>
{/if}
