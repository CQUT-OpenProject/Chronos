<script lang="ts">
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { SchemaForm } from '@chronos/ui-kit';
	import type { ConfigSchema } from '@chronos/core';
	import { getAppEngine, getOfficialPluginService } from '$lib/services/app-engine';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

	let {
		open = $bindable(false),
		pluginId = '',
		pluginName = '',
		schema = {}
	}: {
		open?: boolean;
		pluginId: string;
		pluginName: string;
		schema: ConfigSchema<Record<string, unknown>>;
	} = $props();

	const engine = getAppEngine();
	const officialPlugins = getOfficialPluginService();

	let formValues = $state<Record<string, unknown>>({});
	let saving = $state(false);

	$effect(() => {
		if (open && pluginId) {
			void loadConfig();
		}
	});

	async function loadConfig() {
		try {
			const saved = await officialPlugins.getPluginConfig(pluginId);
			if (saved) {
				formValues = { ...saved };
			} else {
				const ctx = engine.getPluginContext(pluginId);
				formValues = { ...ctx.config };
			}
		} catch {
			formValues = {};
		}
	}

	async function handleSave() {
		saving = true;
		try {
			const ctx = engine.getPluginContext(pluginId);
			await ctx.updateConfig(formValues);
			snackbar(`《${pluginName || pluginId}》设置已保存`);
			open = false;
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbar(`保存设置失败: ${msg}`);
		} finally {
			saving = false;
		}
	}
</script>

<Dialog bind:open title="插件设置 - {pluginName || pluginId}">
	<div class="max-h-[60vh] overflow-y-auto py-2">
		{#if Object.keys(schema).length > 0}
			<SchemaForm {schema} bind:value={formValues} disabled={saving} />
		{:else}
			<p class="m3-body-medium text-on-surface-variant">该插件无可配置项</p>
		{/if}
	</div>

	{#snippet footer()}
		<Button variant="text" disabled={saving} onclick={() => (open = false)}>取消</Button>
		<Button variant="filled" disabled={saving} onclick={handleSave}>
			{saving ? '保存中…' : '保存设置'}
		</Button>
	{/snippet}
</Dialog>
