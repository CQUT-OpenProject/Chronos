<script lang="ts">
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { canSaveCredentials, saveCredentialsLabel } from '$lib/transfer/transfer-state.svelte';

	let {
		transfer,
		onContinue
	}: {
		transfer: TransferStateController;
		onContinue: () => void;
	} = $props();

	const transferState = $derived(transfer.state);
	let fileInput: HTMLInputElement | undefined = $state();
	let loading = $state(false);

	const saveCheckboxEnabled = $derived(canSaveCredentials(transferState.savedCredentialState));
	const saveCheckboxLabel = $derived(saveCredentialsLabel(transferState.savedCredentialState));

	async function handleClipboardPreview() {
		loading = true;
		try {
			const ok = await transfer.previewFromClipboard();
			if (ok) onContinue();
		} finally {
			loading = false;
		}
	}

	async function handleOnlinePreview() {
		loading = true;
		try {
			const ok = await transfer.previewOnline();
			if (ok) onContinue();
		} finally {
			loading = false;
		}
	}

	async function handleSavedCredentialPreview() {
		loading = true;
		try {
			const ok = await transfer.previewWithSavedCredential();
			if (ok) onContinue();
		} finally {
			loading = false;
		}
	}

	async function handleClearSavedCredential() {
		await transfer.clearSavedCredential();
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		loading = true;
		try {
			const ok = await transfer.previewFromHtmlFile(file);
			if (ok) onContinue();
		} finally {
			loading = false;
			input.value = '';
		}
	}
</script>

<div class="space-y-6 p-4">
	<div>
		<h1 class="text-xl font-semibold">导入课表</h1>
		<p class="mt-1 text-sm text-zinc-500">支持教务处在线导入、分享 JSON 与教务 HTML 文件。</p>
	</div>

	<div class="flex gap-2">
		<button
			type="button"
			class="rounded-lg px-3 py-2 text-sm {transferState.selectedSource === 'ONLINE'
				? 'bg-blue-600 text-white'
				: 'border border-zinc-300'}"
			onclick={() => transfer.setSelectedSource('ONLINE')}
		>
			教务处
		</button>
		<button
			type="button"
			class="rounded-lg px-3 py-2 text-sm {transferState.selectedSource === 'JSON'
				? 'bg-blue-600 text-white'
				: 'border border-zinc-300'}"
			onclick={() => transfer.setSelectedSource('JSON')}
		>
			分享 JSON
		</button>
		<button
			type="button"
			class="rounded-lg px-3 py-2 text-sm {transferState.selectedSource === 'HTML'
				? 'bg-blue-600 text-white'
				: 'border border-zinc-300'}"
			onclick={() => transfer.setSelectedSource('HTML')}
		>
			HTML 文件
		</button>
	</div>

	{#if transferState.selectedSource === 'ONLINE'}
		<section class="space-y-3 rounded-xl border border-zinc-200 p-4">
			<h2 class="font-medium">从教务处获取</h2>
			<label class="block space-y-1">
				<span class="text-sm text-zinc-600">账号</span>
				<input
					type="text"
					inputmode="numeric"
					class="w-full rounded-lg border border-zinc-300 px-3 py-2"
					value={transferState.account}
					oninput={(event) => transfer.setAccount((event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="block space-y-1">
				<span class="text-sm text-zinc-600">密码</span>
				<input
					type="password"
					class="w-full rounded-lg border border-zinc-300 px-3 py-2"
					value={transferState.password}
					oninput={(event) => transfer.setPassword((event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			<label class="flex items-center gap-2 text-sm text-zinc-600">
				<input
					type="checkbox"
					checked={transferState.saveCredentials}
					disabled={!saveCheckboxEnabled}
					onchange={(event) =>
						transfer.setSaveCredentials((event.currentTarget as HTMLInputElement).checked)}
				/>
				<span>{saveCheckboxLabel}</span>
			</label>
			<button
				type="button"
				class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
				disabled={loading}
				onclick={handleOnlinePreview}
			>
				{loading ? '获取中…' : '从此账号导入课表'}
			</button>
			{#if transferState.savedCredentialState.hasSavedCredential}
				<div class="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
					<p class="text-sm font-medium">
						已保存账号：{transferState.savedCredentialState.account ?? '未知'}
					</p>
					{#if transferState.savedCredentialState.protectionAvailable}
						<p class="text-sm text-zinc-500">每次使用前都会触发设备验证。</p>
					{:else}
						<p class="text-sm text-zinc-500">仅保存了账号，预览时仍需输入密码。</p>
					{/if}
					{#if transferState.savedCredentialState.protectionAvailable}
						<button
							type="button"
							class="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-60"
							disabled={loading}
							onclick={handleSavedCredentialPreview}
						>
							{loading ? '获取中…' : '验证并预览'}
						</button>
					{/if}
					<button
						type="button"
						class="text-sm text-red-600 disabled:opacity-60"
						disabled={loading}
						onclick={handleClearSavedCredential}
					>
						清除已保存凭据
					</button>
				</div>
			{/if}
		</section>
	{:else if transferState.selectedSource === 'JSON'}
		<section class="space-y-3 rounded-xl border border-zinc-200 p-4">
			<h2 class="font-medium">从分享内容获取</h2>
			<p class="text-sm text-zinc-500">复制 Android 或其他设备导出的课表 JSON 后点击下方按钮。</p>
			<button
				type="button"
				class="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
				disabled={loading}
				onclick={handleClipboardPreview}
			>
				{loading ? '读取中…' : '从剪贴板导入课表'}
			</button>
		</section>
	{:else}
		<section class="space-y-3 rounded-xl border border-zinc-200 p-4">
			<h2 class="font-medium">从文件导入课表</h2>
			<p class="text-sm text-zinc-500">选择教务系统导出的 HTML 课表文件。</p>
			<input
				bind:this={fileInput}
				type="file"
				accept=".html,.htm,text/html"
				class="hidden"
				onchange={handleFileChange}
			/>
			<button
				type="button"
				class="rounded-lg border border-zinc-300 px-4 py-2 disabled:opacity-60"
				disabled={loading}
				onclick={() => fileInput?.click()}
			>
				{loading ? '解析中…' : '选择 HTML 文件'}
			</button>
		</section>
	{/if}

	{#if transferState.preview}
		<div class="rounded-lg bg-zinc-100 px-3 py-2 text-sm">
			当前预览：{transferState.preview.name}（{transferState.preview.courses.length} 门课程）
			<button type="button" class="ml-2 text-blue-600" onclick={() => transfer.clearPreview()}>
				清除
			</button>
		</div>
	{/if}

	{#if transferState.statusMessage}
		<p class="text-sm text-green-700">{transferState.statusMessage}</p>
	{/if}

	{#if transferState.errorMessage}
		<p class="text-sm text-red-600">{transferState.errorMessage}</p>
	{/if}
</div>
