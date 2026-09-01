<script lang="ts">
	import { pluginText, type ImportTabComponentProps } from '@chronos/ui-kit';
	import { SOURCE_CQUT_MESSAGES } from './messages';

	const SOURCE_CQUT_PLUGIN_ID = 'source-cqut';

	let { controller, transfer, onContinue }: ImportTabComponentProps = $props();

	let fileInput: HTMLInputElement | undefined = $state();
	let loading = $state(false);

	function pt(key: keyof (typeof SOURCE_CQUT_MESSAGES)['zh-cn']) {
		return pluginText(controller, SOURCE_CQUT_PLUGIN_ID, SOURCE_CQUT_MESSAGES, key);
	}

	const title = $derived(pt('import.html.tab.title'));
	const intro = $derived(pt('import.html.intro'));
	const submitLabel = $derived(pt(loading ? 'import.html.submit.loading' : 'import.html.submit'));

	function notifyTransferMessages() {
		const { errorMessage } = transfer.state;
		if (errorMessage) {
			controller?.notify(errorMessage, 'error');
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
				fileContent
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
			<h2 class="text-title-medium text-on-surface">{title}</h2>
			<p class="text-body-small mt-0.5 text-on-surface-variant">{intro}</p>
		</div>
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
				class="text-label-large w-full rounded-full border border-outline bg-surface py-3 text-center font-medium text-on-surface disabled:opacity-50"
				disabled={loading}
				onclick={() => fileInput?.click()}
			>
				{submitLabel}
			</button>
		</div>
	</div>
</div>
