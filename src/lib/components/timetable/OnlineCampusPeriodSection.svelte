<script lang="ts">
	import { CQUT_CAMPUS_IDS, getCampusApiName, type CqutCampusId } from '$lib/models/cqut-campus';
	import Radio from '$lib/components/ui/Radio.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';

	let {
		selectedCampus,
		missingCampusMessage = null,
		onSelectCampus
	}: {
		selectedCampus: CqutCampusId;
		missingCampusMessage?: string | null;
		onSelectCampus: (campusId: CqutCampusId) => void;
	} = $props();
</script>

<MineSection title="节次时间">
	{#each CQUT_CAMPUS_IDS as campusId (campusId)}
		{@const selected = selectedCampus === campusId}
		<MineRow title={getCampusApiName(campusId)} onclick={() => onSelectCampus(campusId)}>
			{#snippet trailing()}
				<Radio name="cqut-campus" checked={selected} />
			{/snippet}
		</MineRow>
	{/each}
</MineSection>

{#if missingCampusMessage}
	<p class="m3-body-medium px-1 text-on-surface-variant">{missingCampusMessage}</p>
{/if}
