<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';

	interface Props {
		controller?: ReactiveChronosController;
		transfer: {
			state: {
				errorMessage: string | null;
				statusMessage: string | null;
			};
			previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean>;
		};
		onContinue: () => void;
	}

	let { transfer, onContinue }: Props = $props();

	let fileInput: HTMLInputElement | undefined = $state();
	let loading = $state(false);

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
			<h2 class="m3-title-medium text-on-surface">从文件导入课表</h2>
			<p class="m3-body-small mt-0.5 text-on-surface-variant">选择教务系统导出的 HTML 课表文件。</p>
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
				class="m3-label-large w-full rounded-full border border-outline bg-surface py-3 text-center font-medium text-on-surface disabled:opacity-50"
				disabled={loading}
				onclick={() => fileInput?.click()}
			>
				{loading ? '解析中…' : '选择 HTML 文件'}
			</button>
		</div>
	</div>
</div>
