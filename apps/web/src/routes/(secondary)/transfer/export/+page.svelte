<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { getAppController, getAppEngine } from '$lib/services/app-engine';
	import { checkPrimaryExportWarning } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferExportScreen from '$lib/components/transfer/TransferExportScreen.svelte';

	const controller = getAppController();
	const engine = getAppEngine();

	let exportWarning = $state<string | null>(null);

	$effect(() => {
		void controller.currentTimetable;
		void checkPrimaryExportWarning(engine).then((warning) => {
			exportWarning = warning;
		});
	});
</script>

<SecondaryPageShell title={hostT('route.export')} backHref="/mine">
	<TransferExportScreen warningMessage={exportWarning} />
</SecondaryPageShell>
