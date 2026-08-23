<script lang="ts">
	import { getAppController, getAppEngine } from '$lib/services/app-engine';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferExportScreen from '$lib/components/transfer/TransferExportScreen.svelte';

	const controller = getAppController();
	const engine = getAppEngine();
	const transfer = createTransferState(engine);

	// 警示文案依赖课表内容（如链接长度预估），随响应式课表变化重算；
	// 名称与按钮可用性由 TransferExportScreen 直连 controller 响应式状态。
	let exportWarning = $state<string | null>(null);

	$effect(() => {
		void controller.currentTimetable;
		void transfer.getExportMetadata().then((metadata) => {
			exportWarning = metadata.warningMessage;
		});
	});
</script>

<SecondaryPageShell title="分享课程表" backHref="/mine">
	<TransferExportScreen warningMessage={exportWarning} />
</SecondaryPageShell>
