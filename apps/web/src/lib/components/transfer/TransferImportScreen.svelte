<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import { connectivity } from '$lib/platform/connectivity.svelte';
	import { type TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { onlineImportEnabled } from '$lib/config/features';
	import { getAppController } from '$lib/services/app-engine';
	import OfflineInlineNotice from '$lib/components/connectivity/OfflineInlineNotice.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import { SchemaForm } from '@chronos/ui-kit';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

	let {
		transfer,
		onContinue
	}: {
		transfer: TransferStateController;
		onContinue: () => void;
	} = $props();

	const controller = getAppController();
	const importTabs = $derived(controller.getSlots('import.source.tab'));

	const importSegments = $derived(
		importTabs
			.filter((tab) => tab.id !== 'cqut-online' || onlineImportEnabled)
			.map((tab) => ({
				value: tab.id,
				label: resolveText(tab.title)
			}))
	);

	const transferState = $derived(transfer.state);
	let loading = $state(false);
	let formValues = $state<Record<string, Record<string, unknown>>>({});

	const activeTabId = $derived(transferState.selectedTabId);
	const activeTab = $derived(importTabs.find((tab) => tab.id === activeTabId));
	const onlineImportDisabled = $derived(
		loading || (!connectivity.isOnline && activeTabId === 'cqut-online')
	);

	$effect(() => {
		if (importSegments.length === 0) return;
		if (!importSegments.some((segment) => segment.value === transferState.selectedTabId)) {
			transfer.setSelectedTabId(importSegments[0]!.value);
		}
	});

	$effect(() => {
		for (const tab of importTabs) {
			if (tab.inputSchema && !formValues[tab.id]) {
				formValues[tab.id] = { ...tab.defaultInput };
			}
		}
	});

	function resolveText(text: string | (() => string) | undefined): string {
		if (!text) return '';
		return typeof text === 'function' ? text() : text;
	}

	function notifyTransferMessages() {
		const { statusMessage, errorMessage } = transfer.state;
		if (errorMessage) snackbar(errorMessage);
		else if (statusMessage) snackbar(statusMessage);
	}

	async function handleExecuteTabImport() {
		if (!activeTab) return;
		trackEvent('import_slot_execute_attempt', { source: activeTab.id });
		loading = true;
		try {
			const inputs = formValues[activeTab.id] || { ...activeTab.defaultInput };
			const ok = await transfer.previewWithSlot(activeTab.id, inputs);
			trackEvent(ok ? 'import_slot_execute_success' : 'import_slot_execute_fail', {
				source: activeTab.id
			});
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
		}
	}

	async function handleClipboardPreview() {
		trackEvent('import_share_preview_attempt');
		loading = true;
		try {
			const ok = await transfer.previewFromClipboard();
			trackEvent(ok ? 'import_share_preview_success' : 'import_share_preview_fail');
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
		}
	}

	async function handleSavedCredentialPreview() {
		loading = true;
		try {
			const ok = await transfer.previewWithSavedCredential();
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
		}
	}

	async function handleClearSavedCredential() {
		await transfer.clearSavedCredential();
		notifyTransferMessages();
	}

	function handleTabChange(value: string) {
		transfer.setSelectedTabId(value);
		trackEvent('import_source_select', { source: value });
	}

	const hasOnlineTab = $derived(importTabs.some((tab) => tab.id === 'cqut-online'));
	const hasHtmlTab = $derived(importTabs.some((tab) => tab.id === 'edu-html'));
	const description = $derived(
		hasOnlineTab && onlineImportEnabled
			? '支持知行理工在线导入、分享链接与教务系统导出的 HTML 文件。'
			: hasHtmlTab
				? '支持分享链接与教务系统导出的 HTML 文件。'
				: '支持分享链接导入课表。'
	);
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-5 py-1">
	<p class="m3-body-medium text-on-surface-variant">{description}</p>

	{#if importSegments.length > 1}
		<SegmentedControl
			segments={importSegments}
			value={activeTabId}
			onValueChange={handleTabChange}
		/>
	{/if}

	<div class="w-full">
		{#if activeTab}
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					{#if activeTab.id === 'cqut-online' && !connectivity.isOnline}
						<OfflineInlineNotice />
					{/if}
					<div>
						<h2 class="m3-title-medium text-on-surface">{resolveText(activeTab.title)}</h2>
						{#if activeTab.supportingText}
							<p class="m3-body-small mt-0.5 text-on-surface-variant">
								{resolveText(activeTab.supportingText)}
							</p>
						{/if}
					</div>

					{#if activeTab.inputSchema}
						<SchemaForm
							schema={activeTab.inputSchema}
							bind:value={formValues[activeTab.id]}
							disabled={loading || (activeTab.id === 'cqut-online' && !connectivity.isOnline)}
						/>
					{/if}

					<div class="flex flex-col gap-2 pt-1">
						<Button
							variant="filled"
							class="w-full"
							disabled={onlineImportDisabled}
							onclick={handleExecuteTabImport}
						>
							{loading ? '获取中…' : `从${resolveText(activeTab.title)}导入课表`}
						</Button>

						{#if activeTab.id === 'share-link'}
							<Button
								variant="tonal"
								class="w-full"
								disabled={loading}
								onclick={handleClipboardPreview}
							>
								{loading ? '读取中…' : '从剪贴板快速导入'}
							</Button>
						{/if}
					</div>

					{#if activeTab.id === 'cqut-online' && transferState.savedCredentialState.hasSavedCredential}
						<div class="flex flex-col gap-3 border-t border-outline-variant/60 pt-4">
							<p class="m3-title-small text-on-surface">
								已保存账号：{transferState.savedCredentialState.account ?? '未知'}
							</p>
							{#if transferState.savedCredentialState.savedMode === 'vault'}
								<div class="flex w-full">
									<Button
										variant="outlined"
										class="w-full"
										disabled={onlineImportDisabled}
										onclick={handleSavedCredentialPreview}
									>
										{loading ? '获取中…' : '验证并预览'}
									</Button>
								</div>
							{/if}
							<div class="flex w-full">
								<Button
									variant="text"
									class="w-full"
									disabled={loading}
									onclick={handleClearSavedCredential}
								>
									清除已保存凭据
								</Button>
							</div>
						</div>
					{/if}
				</div>
			</Card>
		{:else}
			<Card variant="outlined">
				<div class="p-4 text-center text-on-surface-variant">未发现可用的课表导入插件</div>
			</Card>
		{/if}
	</div>
</div>
