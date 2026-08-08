<script lang="ts">
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { canSaveCredentials, saveCredentialsLabel } from '$lib/transfer/transfer-state.svelte';
	import { Button, Card, Checkbox, TextFieldOutlined } from 'm3-svelte';

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

	// Tab sources index calculation for sliding pill indicator animation
	const sources = ['ONLINE', 'JSON', 'HTML'] as const;
	const selectedIndex = $derived(sources.indexOf(transferState.selectedSource));

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

<div class="mx-auto flex w-full max-w-md flex-col gap-5 py-1">
	<p class="m3-body-medium text-on-surface-variant">
		支持知行理工在线导入、分享 JSON 与教务 HTML 文件。
	</p>

	<!-- Animated Segmented Tab Switcher with List-Matching bg-surface Background Color -->
	<div class="relative flex w-full rounded-full border border-border bg-surface p-1.5 shadow-xs">
		<!-- Sliding Pill Indicator -->
		<div
			class="absolute top-1.5 bottom-1.5 rounded-full bg-secondary-container shadow-xs transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
			style="left: calc({selectedIndex * 33.333}% - {selectedIndex *
				0.25}rem + 0.5rem); width: calc(33.333% - 0.5rem);"
		></div>

		<!-- Tab Buttons -->
		<button
			type="button"
			class="relative z-10 flex-1 cursor-pointer rounded-full py-2 text-center text-sm font-semibold transition-colors duration-200 {transferState.selectedSource ===
			'ONLINE'
				? 'text-on-secondary-container'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => transfer.setSelectedSource('ONLINE')}
		>
			知行理工
		</button>
		<button
			type="button"
			class="relative z-10 flex-1 cursor-pointer rounded-full py-2 text-center text-sm font-semibold transition-colors duration-200 {transferState.selectedSource ===
			'JSON'
				? 'text-on-secondary-container'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => transfer.setSelectedSource('JSON')}
		>
			分享 JSON
		</button>
		<button
			type="button"
			class="relative z-10 flex-1 cursor-pointer rounded-full py-2 text-center text-sm font-semibold transition-colors duration-200 {transferState.selectedSource ===
			'HTML'
				? 'text-on-secondary-container'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => transfer.setSelectedSource('HTML')}
		>
			HTML 文件
		</button>
	</div>

	<!-- Tab Content Area -->
	<div class="w-full">
		{#if transferState.selectedSource === 'ONLINE'}
			<!-- Tab 1: 知行理工 -->
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					<div>
						<h2 class="m3-title-medium font-bold text-on-surface">从知行理工获取</h2>
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							请输入您在知行理工的学号与密码在线抓取课表。
						</p>
					</div>

					<div class="flex flex-col gap-3.5 pt-1">
						<TextFieldOutlined
							label="账号"
							inputmode="numeric"
							value={transferState.account}
							oninput={(event) =>
								transfer.setAccount((event.currentTarget as HTMLInputElement).value)}
						/>
						<TextFieldOutlined
							label="密码"
							type="password"
							value={transferState.password}
							oninput={(event) =>
								transfer.setPassword((event.currentTarget as HTMLInputElement).value)}
						/>
						<label class="m3-body-medium flex items-center gap-2 pt-1 text-on-surface-variant">
							<Checkbox>
								<input
									type="checkbox"
									checked={transferState.saveCredentials}
									disabled={!saveCheckboxEnabled}
									onchange={(event) =>
										transfer.setSaveCredentials((event.currentTarget as HTMLInputElement).checked)}
								/>
							</Checkbox>
							<span>{saveCheckboxLabel}</span>
						</label>
					</div>

					<div class="m3-actions pt-1">
						<Button variant="filled" disabled={loading} onclick={handleOnlinePreview}>
							{loading ? '获取中…' : '从此账号导入课表'}
						</Button>
					</div>

					{#if transferState.savedCredentialState.hasSavedCredential}
						<div class="flex flex-col gap-3 border-t border-outline-variant/60 pt-4">
							<p class="m3-title-small font-bold text-on-surface">
								已保存账号：{transferState.savedCredentialState.account ?? '未知'}
							</p>
							{#if transferState.savedCredentialState.protectionAvailable}
								<p class="m3-body-small text-on-surface-variant">每次使用前都会触发设备验证。</p>
							{:else}
								<p class="m3-body-small text-on-surface-variant">
									仅保存了账号，预览时仍需输入密码。
								</p>
							{/if}
							{#if transferState.savedCredentialState.protectionAvailable}
								<div class="m3-actions">
									<Button
										variant="outlined"
										disabled={loading}
										onclick={handleSavedCredentialPreview}
									>
										{loading ? '获取中…' : '验证并预览'}
									</Button>
								</div>
							{/if}
							<div class="m3-actions">
								<Button variant="text" disabled={loading} onclick={handleClearSavedCredential}>
									清除已保存凭据
								</Button>
							</div>
						</div>
					{/if}
				</div>
			</Card>
		{:else if transferState.selectedSource === 'JSON'}
			<!-- Tab 2: 分享 JSON -->
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					<div>
						<h2 class="m3-title-medium font-bold text-on-surface">从分享内容获取</h2>
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							复制 Android 或其他设备导出的课表 JSON 后点击下方按钮。
						</p>
					</div>
					<div class="m3-actions pt-1">
						<Button variant="filled" disabled={loading} onclick={handleClipboardPreview}>
							{loading ? '读取中…' : '从剪贴板导入课表'}
						</Button>
					</div>
				</div>
			</Card>
		{:else}
			<!-- Tab 3: HTML 文件 -->
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					<div>
						<h2 class="m3-title-medium font-bold text-on-surface">从文件导入课表</h2>
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
					<div class="m3-actions pt-1">
						<Button variant="outlined" disabled={loading} onclick={() => fileInput?.click()}>
							{loading ? '解析中…' : '选择 HTML 文件'}
						</Button>
					</div>
				</div>
			</Card>
		{/if}
	</div>

	{#if transferState.preview}
		<div class="w-full">
			<Card variant="filled">
				<div class="flex items-center justify-between p-1">
					<p class="m3-body-medium font-medium">
						当前预览：{transferState.preview.name}（{transferState.preview.courses.length} 门课程）
					</p>
					<Button variant="text" size="s" onclick={() => transfer.clearPreview()}>清除</Button>
				</div>
			</Card>
		</div>
	{/if}

	{#if transferState.statusMessage}
		<p class="m3-body-medium text-success">{transferState.statusMessage}</p>
	{/if}

	{#if transferState.errorMessage}
		<p class="m3-body-medium text-danger">{transferState.errorMessage}</p>
	{/if}
</div>
