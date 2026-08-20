<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { getAppController } from '$lib/services/app-engine';
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

	let selectedTabId = $state<string>('');
	let formValues = $state<Record<string, unknown>>({});
	let loading = $state(false);

	$effect(() => {
		if (
			importTabs.length > 0 &&
			(!selectedTabId || !importTabs.some((t) => t.id === selectedTabId))
		) {
			selectedTabId = importTabs[0]!.id;
		}
	});

	const activeTab = $derived(importTabs.find((t) => t.id === selectedTabId) ?? importTabs[0]);

	$effect(() => {
		if (activeTab?.defaultInput) {
			formValues = { ...activeTab.defaultInput };
		} else {
			formValues = {};
		}
	});

	function resolveText(text: string | (() => string) | undefined): string {
		if (!text) return '';
		return typeof text === 'function' ? text() : text;
	}

	async function handleExecuteImport() {
		if (!activeTab) return;
		loading = true;
		trackEvent('import_slot_execute_attempt', { sourceId: activeTab.id });
		try {
			const ctx = controller.rawEngine.getPluginContext(activeTab.id);
			const timetable = await activeTab.executeImport(formValues, ctx);
			if (!timetable || !timetable.courses || timetable.courses.length === 0) {
				throw new Error('未识别到任何有效课程数据');
			}
			transfer.setDirectPreview(
				timetable,
				activeTab.id === 'cqut-online'
					? 'ONLINE'
					: activeTab.id === 'edu-html'
						? 'HTML'
						: 'SHARE_LINK'
			);
			trackEvent('import_slot_execute_success', { sourceId: activeTab.id });
			onContinue();
		} catch (err: unknown) {
			trackEvent('import_slot_execute_fail', { sourceId: activeTab.id });
			const msg = err instanceof Error ? err.message : '导入课表失败，请检查输入内容';
			snackbar(msg);
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-5 py-1">
	<p class="m3-body-medium text-on-surface-variant">支持从已安装的插件数据源动态导入课表。</p>

	{#if importTabs.length > 1}
		<SegmentedControl
			segments={importTabs.map((tab) => ({
				value: tab.id,
				label: resolveText(tab.title)
			}))}
			value={selectedTabId}
			onValueChange={(val) => {
				selectedTabId = val;
				trackEvent('import_source_select', { source: val });
			}}
		/>
	{/if}

	{#if activeTab}
		<Card variant="outlined">
			<div class="flex flex-col gap-4 p-4">
				<div>
					<h2 class="m3-title-medium text-on-surface">{resolveText(activeTab.title)}</h2>
					{#if activeTab.supportingText}
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							{resolveText(activeTab.supportingText)}
						</p>
					{/if}
				</div>

				{#if activeTab.inputSchema}
					<SchemaForm schema={activeTab.inputSchema} bind:value={formValues} disabled={loading} />
				{/if}

				<div class="flex w-full pt-2">
					<Button variant="filled" class="w-full" disabled={loading} onclick={handleExecuteImport}>
						{loading ? '正在导入…' : `从${resolveText(activeTab.title)}导入课表`}
					</Button>
				</div>
			</div>
		</Card>
	{:else}
		<Card variant="outlined">
			<div class="p-4 text-center text-on-surface-variant">未发现可用的课表导入插件</div>
		</Card>
	{/if}
</div>
