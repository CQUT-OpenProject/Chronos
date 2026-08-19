<script lang="ts">
	import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';
	import SchemaForm from '../schema-form/SchemaForm.svelte';

	interface Props {
		controller: ReactiveChronosController;
		pluginId: string;
		viewId?: string;
	}

	let { controller, pluginId, viewId = 'index' }: Props = $props();

	// Find the screen contribution from shell.route.screen slot
	const screenSlot = $derived(
		controller
			.getSlots('shell.route.screen')
			.find((s) => s.id === viewId || s.id === `${pluginId}/${viewId}`)
	);

	let formValues = $state<Record<string, unknown>>({});
</script>

<div class="flex w-full flex-col p-4">
	{#if screenSlot?.component}
		<!-- In-Process plugins render custom Svelte component -->
		{@const DynamicComponent = screenSlot.component}
		<DynamicComponent {controller} {pluginId} />
	{:else if screenSlot?.schema}
		<!-- Sandboxed / Schema plugins render dynamic SchemaForm -->
		<div class="rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs">
			<SchemaForm schema={screenSlot.schema} bind:value={formValues} />
		</div>
	{:else}
		<!-- Fallback when slot is not registered or plugin is unloaded -->
		<div
			class="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant"
		>
			<p class="text-base font-medium">页面不存在或插件已卸载</p>
			<p class="mt-1 text-xs opacity-75">Plugin: {pluginId} / View: {viewId}</p>
		</div>
	{/if}
</div>
