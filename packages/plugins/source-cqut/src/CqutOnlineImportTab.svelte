<script lang="ts">
	import { pluginText, type ImportTabComponentProps } from '@chronos/ui-kit';
	import { SOURCE_CQUT_MESSAGES } from './messages';

	const SOURCE_CQUT_PLUGIN_ID = 'source-cqut';

	let { controller, transfer, onContinue }: ImportTabComponentProps = $props();
	let loading = $state(false);
	let account = $state('');
	let password = $state('');
	let passwordVisible = $state(false);
	let isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);

	function handleOnline() {
		isOnline = true;
	}

	function handleOffline() {
		isOnline = false;
	}

	function pt(key: keyof (typeof SOURCE_CQUT_MESSAGES)['zh-cn']) {
		return pluginText(controller, SOURCE_CQUT_PLUGIN_ID, SOURCE_CQUT_MESSAGES, key);
	}

	const offlineMessage = $derived(pt('import.online.offline'));
	const title = $derived(pt('import.online.tab.title'));
	const intro = $derived(pt('import.online.intro'));
	const accountLabel = $derived(pt('import.online.accountLabel'));
	const passwordTitle = $derived(pt('import.online.field.password.title'));
	const passwordToggleLabel = $derived(
		pt(passwordVisible ? 'import.online.password.hide' : 'import.online.password.show')
	);
	const submitLabel = $derived(
		pt(loading ? 'import.online.submit.loading' : 'import.online.submit')
	);

	const onlineImportDisabled = $derived(loading || !isOnline);

	function notifyTransferMessages() {
		const { errorMessage } = transfer.state;
		if (errorMessage) {
			controller?.notify(errorMessage, 'error');
		}
	}

	async function handleOnlinePreview() {
		loading = true;
		try {
			const ok = await transfer.previewWithSlot('cqut-online', {
				username: account,
				password
			});
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
		}
	}
</script>

<svelte:window ononline={handleOnline} onoffline={handleOffline} />

<div class="rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs">
	<div class="flex flex-col gap-4">
		{#if !isOnline}
			<div class="flex items-center gap-2 rounded-xl bg-error-container/40 p-3 text-error">
				<span class="text-body-small">{offlineMessage}</span>
			</div>
		{/if}
		<div>
			<h2 class="text-title-medium text-on-surface">{title}</h2>
			<p class="text-body-small mt-0.5 text-on-surface-variant">{intro}</p>
		</div>

		<div class="flex flex-col gap-3">
			<div class="ui-form-field">
				<label class="ui-field-label" for="import-account">{accountLabel}</label>
				<input
					id="import-account"
					class="ui-form-field-input"
					type="text"
					inputmode="numeric"
					autocomplete="username"
					bind:value={account}
				/>
			</div>
			<div class="ui-form-field">
				<label class="ui-field-label" for="import-password">{passwordTitle}</label>
				<div class="ui-form-field-input-row">
					<input
						id="import-password"
						class="ui-form-field-input"
						type={passwordVisible ? 'text' : 'password'}
						autocomplete="current-password"
						bind:value={password}
					/>
					<button
						type="button"
						class="flex size-8 items-center justify-center text-on-surface-variant"
						onclick={() => (passwordVisible = !passwordVisible)}
						aria-label={passwordToggleLabel}
					>
						{#if passwordVisible}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="size-5"
							>
								<path
									d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
								/>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="size-5"
							>
								<path
									d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>

		<div class="flex w-full pt-1">
			<button
				type="button"
				class="text-label-large w-full rounded-full bg-primary py-3 text-center font-medium text-on-primary disabled:opacity-50"
				disabled={onlineImportDisabled}
				onclick={handleOnlinePreview}
			>
				{submitLabel}
			</button>
		</div>
	</div>
</div>
