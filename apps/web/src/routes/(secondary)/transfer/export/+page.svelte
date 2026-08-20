<script lang="ts">
	import { onMount } from 'svelte';
	import { getAppEngine } from '$lib/services/app-engine';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferExportScreen from '$lib/components/transfer/TransferExportScreen.svelte';

	const engine = getAppEngine();
	const transfer = createTransferState(engine);

	let currentTimetableName = $state<string | null>(null);
	let longLinkWarning = $state(false);

	onMount(async () => {
		const metadata = await transfer.getExportMetadata();
		currentTimetableName = metadata.timetableName;
		longLinkWarning = metadata.longLinkWarning;
	});
</script>

<SecondaryPageShell title="导出课表" backHref="/mine" flush>
	<TransferExportScreen {currentTimetableName} {longLinkWarning} />
</SecondaryPageShell>
