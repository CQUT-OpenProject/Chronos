<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { sharePluginText } from './plugin-text';

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

	let loading = $state(false);

	const title = $derived(sharePluginText(controller, 'import.ui.title'));
	const subtitle = $derived(sharePluginText(controller, 'import.ui.subtitle'));
	const loadingLabel = $derived(sharePluginText(controller, 'import.ui.loading'));
	const clipboardLabel = $derived(sharePluginText(controller, 'import.ui.clipboard'));

	function notifyTransferMessages() {
		const { errorMessage } = transfer.state;
		if (errorMessage) {
			alert(errorMessage);
		}
	}

	async function handleClipboardPreview() {
		loading = true;
		try {
			const content = await navigator.clipboard.readText();
			const ok = await transfer.previewWithSlot('share-link', {
				content: content.trim()
			});
			if (ok) onContinue();
			else notifyTransferMessages();
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: sharePluginText(controller, 'import.ui.clipboardError');
			alert(msg);
		} finally {
			loading = false;
		}
	}
</script>

<div class="rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs">
	<div class="flex flex-col gap-4">
		<div>
			<h2 class="m3-title-medium text-on-surface">{title}</h2>
			<p class="m3-body-small mt-0.5 text-on-surface-variant">{subtitle}</p>
		</div>
		<div class="flex w-full pt-1">
			<button
				type="button"
				class="m3-label-large w-full rounded-full bg-primary py-3 text-center font-medium text-on-primary disabled:opacity-50"
				disabled={loading}
				onclick={handleClipboardPreview}
			>
				{loading ? loadingLabel : clipboardLabel}
			</button>
		</div>
	</div>
</div>
