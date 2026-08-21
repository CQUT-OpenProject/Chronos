<script lang="ts">
	import { trackEvent } from '$lib/client/analytics';
	import { connectivity } from '$lib/platform/connectivity.svelte';
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { canSaveCredentials, saveCredentialsLabel } from '$lib/transfer/transfer-state.svelte';
	import OfflineInlineNotice from '$lib/components/connectivity/OfflineInlineNotice.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { onlineImportEnabled } from '$lib/config/features';
	import { getAppController } from '$lib/services/app-engine';

	let {
		transfer,
		onContinue
	}: {
		transfer: TransferStateController;
		onContinue: () => void;
	} = $props();

	const controller = getAppController();
	const availableSlots = $derived(controller.getSlots('import.source.tab'));
	const importSegments = $derived(
		availableSlots
			.filter((slot) => onlineImportEnabled || slot.id !== 'cqut-online')
			.map((slot) => ({
				value: slot.id,
				label: typeof slot.title === 'function' ? slot.title() : slot.title
			}))
	);

	const transferState = $derived(transfer.state);
	let fileInput: HTMLInputElement | undefined = $state();
	let loading = $state(false);

	const saveCheckboxEnabled = $derived(canSaveCredentials(transferState.savedCredentialState));
	const saveCheckboxLabel = $derived(saveCredentialsLabel(transferState.savedCredentialState));
	const onlineImportDisabled = $derived(loading || !connectivity.isOnline);

	function notifyTransferMessages() {
		const { statusMessage, errorMessage } = transfer.state;
		if (errorMessage) snackbar(errorMessage);
		else if (statusMessage) snackbar(statusMessage);
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

	async function handleOnlinePreview() {
		trackEvent('import_online_preview_attempt');
		loading = true;
		try {
			const ok = await transfer.previewOnline();
			trackEvent(ok ? 'import_online_preview_success' : 'import_online_preview_fail');
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

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		trackEvent('import_html_preview_attempt');
		loading = true;
		try {
			const ok = await transfer.previewFromHtmlFile(file);
			trackEvent(ok ? 'import_html_preview_success' : 'import_html_preview_fail');
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
			input.value = '';
		}
	}

	function handleSourceChange(slotId: string) {
		transfer.setSelectedSlotId(slotId);
		trackEvent('import_source_select', { slotId });
	}
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-5 py-1">
	<p class="m3-body-medium text-on-surface-variant">
		{onlineImportEnabled
			? '支持知行理工在线导入、分享链接与教务系统导出的 HTML 文件。'
			: '支持分享链接与教务系统导出的 HTML 文件。'}
	</p>

	{#if importSegments.length > 1}
		<SegmentedControl
			segments={importSegments}
			value={transferState.selectedSlotId}
			onValueChange={handleSourceChange}
		/>
	{/if}

	<div class="w-full">
		{#if onlineImportEnabled && transferState.selectedSlotId === 'cqut-online'}
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					{#if !connectivity.isOnline}
						<OfflineInlineNotice />
					{/if}
					<div>
						<h2 class="m3-title-medium text-on-surface">从知行理工获取</h2>
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							请输入知行理工账号密码以获取在线课表。
						</p>
					</div>

					<FormCard variant="plain">
						<TextField
							id="import-account"
							label="工号 / 学号"
							type="text"
							inputmode="numeric"
							autocomplete="username"
							value={transferState.account}
							onValueChange={(value) => transfer.setAccount(value)}
						/>
						<TextField
							id="import-password"
							label="密码"
							type="password"
							autocomplete="current-password"
							value={transferState.password}
							onValueChange={(value) => transfer.setPassword(value)}
						/>
					</FormCard>
					<label
						class="m3-body-medium flex cursor-pointer items-center gap-2 px-1 text-on-surface-variant"
					>
						<Checkbox
							checked={transferState.saveCredentials}
							disabled={!saveCheckboxEnabled}
							onCheckedChange={(checked) => transfer.setSaveCredentials(checked === true)}
						/>
						<span>{saveCheckboxLabel}</span>
					</label>

					<div class="flex w-full pt-1">
						<Button
							variant="filled"
							class="w-full"
							disabled={onlineImportDisabled}
							onclick={handleOnlinePreview}
						>
							{loading ? '获取中…' : '从此账号导入课表'}
						</Button>
					</div>

					{#if transferState.savedCredentialState.hasSavedCredential}
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
		{:else if transferState.selectedSlotId === 'share-link'}
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					<div>
						<h2 class="m3-title-medium text-on-surface">从分享链接导入</h2>
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							复制课表分享链接后点击下方按钮
						</p>
					</div>
					<div class="flex w-full pt-1">
						<Button
							variant="filled"
							class="w-full"
							disabled={loading}
							onclick={handleClipboardPreview}
						>
							{loading ? '读取中…' : '从剪贴板导入课表'}
						</Button>
					</div>
				</div>
			</Card>
		{:else}
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					<div>
						<h2 class="m3-title-medium text-on-surface">从文件导入课表</h2>
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							选择教务系统导出的 HTML 课表文件。
						</p>
					</div>
					<input
						bind:this={fileInput}
						type="file"
						accept=".html,.htm,text/html"
						class="hidden"
						onchange={handleFileChange}
					/>
					<div class="flex w-full pt-1">
						<Button
							variant="outlined"
							class="w-full"
							disabled={loading}
							onclick={() => fileInput?.click()}
						>
							{loading ? '解析中…' : '选择 HTML 文件'}
						</Button>
					</div>
				</div>
			</Card>
		{/if}
	</div>
</div>
