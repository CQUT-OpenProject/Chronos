<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { cqutPluginText } from './plugin-text';

	interface Props {
		controller?: ReactiveChronosController;
		transfer: {
			state: {
				errorMessage: string | null;
			};
			previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean>;
		};
		onContinue: () => void;
	}

	let { controller, transfer, onContinue }: Props = $props();

	let fileInput: HTMLInputElement | undefined = $state();
	let loading = $state(false);
	let campusId = $state<'liangjiang' | 'huaxi'>('liangjiang');

	const title = $derived(cqutPluginText(controller, 'import.html.tab.title'));
	const intro = $derived(cqutPluginText(controller, 'import.html.intro'));
	const campusLabel = $derived(cqutPluginText(controller, 'import.html.campusLabel'));
	const campusOptions = $derived.by(() => [
		{
			id: 'liangjiang' as const,
			label: cqutPluginText(controller, 'import.html.campus.liangjiang')
		},
		{ id: 'huaxi' as const, label: cqutPluginText(controller, 'import.html.campus.huaxi') }
	]);
	const submitLabel = $derived(
		cqutPluginText(controller, loading ? 'import.html.submit.loading' : 'import.html.submit')
	);

	function notifyTransferMessages() {
		const { errorMessage } = transfer.state;
		if (errorMessage) {
			alert(errorMessage);
		}
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		loading = true;
		try {
			const fileContent = await file.text();
			const ok = await transfer.previewWithSlot('edu-html', {
				file: fileContent,
				fileContent,
				campusId
			});
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
			input.value = '';
		}
	}
</script>

<div class="rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs">
	<div class="flex flex-col gap-4">
		<div>
			<h2 class="m3-title-medium text-on-surface">{title}</h2>
			<p class="m3-body-small mt-0.5 text-on-surface-variant">{intro}</p>
		</div>
		<label class="flex items-center gap-2 text-sm text-on-surface-variant">
			<span>{campusLabel}</span>
			<select
				bind:value={campusId}
				class="m3-body-medium flex-1 rounded-lg border border-outline bg-surface px-3 py-2 text-on-surface outline-none"
			>
				{#each campusOptions as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</label>
		<input
			bind:this={fileInput}
			type="file"
			accept=".html,.htm,text/html"
			class="hidden"
			onchange={handleFileChange}
		/>
		<div class="flex w-full pt-1">
			<button
				type="button"
				class="m3-label-large w-full rounded-full border border-outline bg-surface py-3 text-center font-medium text-on-surface disabled:opacity-50"
				disabled={loading}
				onclick={() => fileInput?.click()}
			>
				{submitLabel}
			</button>
		</div>
	</div>
</div>
