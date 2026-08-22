<script lang="ts">
	import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';
	import SchemaForm from '../schema-form/SchemaForm.svelte';
	import { resolvePluginScreenSlot } from './resolve-plugin-screen-slot';

	interface Props {
		controller: ReactiveChronosController;
		pluginId: string;
		viewId?: string;
	}

	let { controller, pluginId, viewId = 'index' }: Props = $props();

	const screenSlot = $derived(
		resolvePluginScreenSlot(controller.getSlots('shell.route.screen'), pluginId, viewId)
	);

	const isMountableComponent = $derived(
		typeof (screenSlot?.component as { mount?: unknown } | undefined)?.mount === 'function'
	);

	let containerEl = $state<HTMLDivElement>();
	let formValues = $state<Record<string, unknown>>({});
	let saving = $state(false);
	let saveError = $state<string | null>(null);

	$effect(() => {
		if (!containerEl || !screenSlot?.component || !isMountableComponent) return;
		const comp = screenSlot.component as {
			mount(
				target: HTMLElement,
				props: Record<string, unknown>
			): { unmount?(): void } | (() => void);
		};
		const instance = comp.mount(containerEl, { controller, pluginId });
		return () => {
			if (typeof instance === 'function') {
				instance();
			} else if (typeof instance?.unmount === 'function') {
				instance.unmount();
			}
		};
	});

	$effect(() => {
		if (!screenSlot?.schema || screenSlot?.component) return;
		try {
			const ctx = controller.getPluginContext(pluginId);
			formValues = { ...ctx.config };
		} catch {
			formValues = {};
		}
	});

	async function saveSchemaConfig() {
		if (!screenSlot?.schema) return;
		saving = true;
		saveError = null;
		try {
			const ctx = controller.getPluginContext(pluginId);
			await ctx.updateConfig(formValues);
		} catch (err: unknown) {
			saveError = err instanceof Error ? err.message : '保存失败';
		} finally {
			saving = false;
		}
	}
</script>

{#if screenSlot?.component}
	{#if isMountableComponent}
		<div bind:this={containerEl} class="flex min-h-0 w-full flex-1 flex-col"></div>
	{:else}
		{@const DynamicComponent = screenSlot.component as import('svelte').Component<{
			controller: ReactiveChronosController;
			pluginId: string;
		}>}
		<div class="flex min-h-0 w-full flex-1 flex-col">
			<DynamicComponent {controller} {pluginId} />
		</div>
	{/if}
{:else if screenSlot?.schema}
	<div class="flex w-full flex-col p-4">
		<div class="flex flex-col gap-4 rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs">
			<SchemaForm schema={screenSlot.schema} bind:value={formValues} {controller} />
			{#if saveError}
				<p class="m3-body-small text-error">{saveError}</p>
			{/if}
			<button
				type="button"
				class="m3-label-large rounded-full bg-primary px-4 py-3 text-on-primary disabled:opacity-50"
				disabled={saving}
				onclick={saveSchemaConfig}
			>
				{saving ? '保存中…' : '保存设置'}
			</button>
		</div>
	</div>
{:else}
	<div class="flex w-full flex-col p-4">
		<div
			class="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant"
		>
			<p class="text-base font-medium">页面不存在或插件已卸载</p>
			<p class="mt-1 text-xs opacity-75">Plugin: {pluginId} / View: {viewId}</p>
		</div>
	</div>
{/if}
