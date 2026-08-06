<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { getRepository } from '$lib/client/repository';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import TransferExportScreen from '$lib/components/transfer/TransferExportScreen.svelte';

	const transfer = createTransferState();
	let currentTimetableName = $state<string | null>(null);

	onMount(async () => {
		const snapshot = await getRepository().getAppStateSnapshot();
		currentTimetableName = snapshot.currentTimetable?.name ?? null;
	});
</script>

<TransferExportScreen {transfer} {currentTimetableName} />

<p class="px-4 pb-4">
	<a href={resolve('/mine')} class="text-sm text-blue-600">返回</a>
</p>
