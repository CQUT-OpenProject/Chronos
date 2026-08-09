<script lang="ts">
	import { onMount } from 'svelte';
	import { getRepository } from '$lib/client/repository';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import { ChronosTimetableShareLinkCodec } from '$lib/parsers/share-link/chronos-timetable-share-link-codec';
	import { SHARE_LINK_WARNING_LENGTH } from '$lib/parsers/share-link/chronos-share-link-codec';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferExportScreen from '$lib/components/transfer/TransferExportScreen.svelte';

	const transfer = createTransferState();
	const shareLinkCodec = new ChronosTimetableShareLinkCodec();

	let currentTimetableName = $state<string | null>(null);
	let longLinkWarning = $state(false);

	onMount(async () => {
		const snapshot = await getRepository().getAppStateSnapshot();
		const timetable = snapshot.currentTimetable;
		currentTimetableName = timetable?.name ?? null;
		longLinkWarning = timetable
			? shareLinkCodec.estimatePayloadLength(timetable) > SHARE_LINK_WARNING_LENGTH
			: false;
	});
</script>

<SecondaryPageShell title="导出课表" backHref="/mine" flush>
	<TransferExportScreen {transfer} {currentTimetableName} {longLinkWarning} />
</SecondaryPageShell>
