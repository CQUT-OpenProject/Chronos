<script lang="ts">
	import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';
	import SchemaForm from '../schema-form/SchemaForm.svelte';
	import { resolvePluginScreenSlot } from './resolve-plugin-screen-slot';
	import MountableSlotOutlet from './MountableSlotOutlet.svelte';

	interface Props {
		controller: ReactiveChronosController;
		pluginId: string;
		viewId?: string;
		active?: boolean;
	}

	let { controller, pluginId, viewId = 'index', active = true }: Props = $props();

	const hostT = (key: string, params?: Record<string, unknown>) =>
		controller.translatePlugin('host-ui', key, params);

	const screenSlot = $derived(
		resolvePluginScreenSlot(controller.getSlots('shell.route.screen'), pluginId, viewId)
	);

	let formValues = $state<Record<string, unknown>>({});
	let saving = $state(false);
	let saveError = $state<string | null>(null);

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
			saveError =
				err instanceof Error
					? hostT('plugins.config.saveFailed', { message: err.message })
					: hostT('plugins.config.saveFailed', { message: hostT('common.loadFailed') });
		} finally {
			saving = false;
		}
	}
</script>

{#if screenSlot?.component}
	<MountableSlotOutlet
		component={screenSlot.component}
		props={{ controller, pluginId, active }}
		class="flex min-h-0 w-full flex-1 flex-col"
	/>
{:else if screenSlot?.schema}
	<div class="flex w-full flex-col p-4">
		<div class="flex flex-col gap-4 rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs">
			<SchemaForm schema={screenSlot.schema} bind:value={formValues} {controller} />
			{#if saveError}
				<p class="text-body-small text-error">{saveError}</p>
			{/if}
			<button
				type="button"
				class="text-label-large rounded-full bg-primary px-4 py-3 text-on-primary disabled:opacity-50"
				disabled={saving}
				onclick={saveSchemaConfig}
			>
				{saving ? hostT('plugins.config.saving') : hostT('plugins.config.save')}
			</button>
		</div>
	</div>
{:else}
	<div class="flex w-full flex-col p-4">
		<div
			class="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant"
		>
			<p class="text-base font-medium">{hostT('pluginScreen.notFound')}</p>
			<p class="mt-1 text-xs opacity-75">
				{hostT('pluginScreen.notFoundDetail', { pluginId, viewId })}
			</p>
		</div>
	</div>
{/if}
