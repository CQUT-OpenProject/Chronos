<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { onMount } from 'svelte';
	import {
		getOfficialPluginService,
		getProfileBuiltinPlugins,
		getAppController
	} from '$lib/services/app-engine';
	import type { InstalledOfficialPluginRecord } from '$lib/services/official-plugins/official-plugin-service';
	import type { PluginManifest, ConfigSchema } from '@chronos/core';
	import { resolveLocaleMapText } from '@chronos/core';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import ActionBottomBar from '$lib/components/ui/ActionBottomBar.svelte';
	import PluginConfigModal from './PluginConfigModal.svelte';
	import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';

	import { resolveColorSchemeId } from '$lib/appearance/color-scheme';
	import { groupCatalogManifestsByCategory } from '$lib/services/official-plugins/catalog-sort';
	import { getPluginCategoryMeta } from '$lib/services/official-plugins/plugin-tags';
	import { assertValidManifestInstallUrl } from '$lib/services/official-plugins/manifest-url';
	import { CheckCircleFill, TuneFill } from '$lib/icons';

	const BUILTIN_CATALOG_URL = '/official-plugins/catalog.json';

	const officialPlugins = getOfficialPluginService();
	const profileBuiltinPlugins = $derived(getProfileBuiltinPlugins());
	const appController = getAppController();
	const paletteMode = $derived(appController.userPreferences?.paletteMode ?? 'vibrant');
	const visualThemeId = $derived(appController.activeThemeId);
	const activeColorSchemeId = $derived(resolveColorSchemeId(paletteMode, visualThemeId));

	let activeTab = $state<'installed' | 'official'>('installed');

	let installedRecords = $state.raw<InstalledOfficialPluginRecord[]>([]);
	let catalogManifests = $state.raw<Array<{ url: string; manifest: PluginManifest }>>([]);
	let loadingCatalog = $state(false);
	let catalogError = $state<string | null>(null);
	let operatingPluginId = $state<string | null>(null);

	let configModalOpen = $state(false);
	let configModalData = $state<{
		id: string;
		name: string;
		schema: ConfigSchema<Record<string, unknown>>;
	}>({
		id: '',
		name: '',
		schema: {}
	});

	let uninstallDialogOpen = $state(false);
	let uninstallTarget = $state<{ id: string; name: string }>({ id: '', name: '' });

	let linkInstallDialogOpen = $state(false);
	let linkInstallInProgress = $state(false);
	let manifestUrlInput = $state('');

	function refreshInstalled() {
		installedRecords = [...officialPlugins.listInstalled()];
	}

	onMount(() => {
		void officialPlugins.init().then(async () => {
			refreshInstalled();
			await loadOfficialCatalog();
		});

		const sub = officialPlugins.onChanged(() => {
			refreshInstalled();
		});

		return () => {
			sub.dispose();
		};
	});

	async function loadOfficialCatalog() {
		loadingCatalog = true;
		catalogError = null;
		try {
			const catalog = await officialPlugins.fetchCatalog(BUILTIN_CATALOG_URL);
			const entries = await Promise.all(
				catalog.manifests.map(async (url) => {
					try {
						const manifest = await officialPlugins.fetchManifest(url);
						return { url, manifest };
					} catch (err) {
						console.error(`[PluginsScreen] Failed to fetch manifest ${url}:`, err);
						return null;
					}
				})
			);
			catalogManifests = entries.filter((entry) => entry !== null);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			catalogError = msg;
		} finally {
			loadingCatalog = false;
		}
	}

	const activeLocale = $derived(appController.currentLocale);

	const groupedCatalogManifests = $derived.by(() => {
		const locale = activeLocale;
		return groupCatalogManifestsByCategory(catalogManifests, locale);
	});

	const tabSegments = $derived.by(() => {
		void appController.currentLocale;
		void appController.slotVersion;
		return [
			{
				value: 'installed',
				label: hostT('plugins.tab.installed', {
					count: profileBuiltinPlugins.length + installedRecords.length
				})
			},
			{ value: 'official', label: hostT('plugins.tab.market') }
		];
	});

	function resolveManifestText(
		value: string | Record<string, string> | (() => string) | undefined
	): string {
		if (!value) return '';
		if (typeof value === 'function') return value();
		if (typeof value === 'string') return value;
		return resolveLocaleMapText(value, activeLocale);
	}

	function isInstalled(pluginId: string): boolean {
		return (
			profileBuiltinPlugins.some((p) => p.id === pluginId) ||
			installedRecords.some((r) => r.manifest.id === pluginId)
		);
	}

	function isThemePluginInUse(manifest: PluginManifest, enabled: boolean): boolean {
		// themeId 由构建期从 colors JSON 显式写入，宿主不猜测 id 前缀
		return Boolean(enabled && manifest.themeId && activeColorSchemeId === manifest.themeId);
	}

	async function handleInstall(manifest: PluginManifest, manifestUrl?: string) {
		operatingPluginId = manifest.id;
		try {
			await officialPlugins.install(manifest, manifestUrl);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbarKey('snackbar.install.failed', { message: msg });
		} finally {
			operatingPluginId = null;
		}
	}

	function promptLinkInstall() {
		manifestUrlInput = '';
		linkInstallDialogOpen = true;
	}

	async function confirmLinkInstall() {
		const url = manifestUrlInput.trim();
		if (!url) {
			snackbarKey('snackbar.manifestRequired');
			return;
		}

		try {
			assertValidManifestInstallUrl(url);
		} catch {
			snackbarKey('snackbar.manifestInvalid');
			return;
		}

		linkInstallInProgress = true;
		operatingPluginId = 'url-install';
		try {
			await officialPlugins.installFromManifestUrl(url);
			activeTab = 'installed';
			linkInstallDialogOpen = false;
			manifestUrlInput = '';
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbarKey('snackbar.install.failed', { message: msg });
		} finally {
			linkInstallInProgress = false;
			operatingPluginId = null;
		}
	}

	function promptUninstall(pluginId: string, pluginName: string) {
		uninstallTarget = { id: pluginId, name: pluginName };
		uninstallDialogOpen = true;
	}

	async function confirmUninstall() {
		const targetId = uninstallTarget.id;
		if (!targetId) return;
		uninstallDialogOpen = false;
		operatingPluginId = targetId;
		try {
			await officialPlugins.uninstall(targetId);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbarKey('snackbar.uninstall.failed', { message: msg });
		} finally {
			operatingPluginId = null;
		}
	}

	async function handleToggleEnabled(pluginId: string, enabled: boolean) {
		operatingPluginId = pluginId;
		try {
			if (enabled) {
				await officialPlugins.enable(pluginId);
			} else {
				await officialPlugins.disable(pluginId);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbarKey('snackbar.toggle.failed', { message: msg });
		} finally {
			operatingPluginId = null;
		}
	}

	function handleOpenConfig(
		id: string,
		name: string,
		schema?: ConfigSchema<Record<string, unknown>>
	) {
		if (!schema) return;
		configModalData = {
			id,
			name,
			schema
		};
		configModalOpen = true;
	}
</script>

{#snippet linkImportFooter()}
	<Button variant="outlined" class="w-full" onclick={promptLinkInstall}>
		{hostT('plugins.link.open')}
	</Button>
{/snippet}

<div class="flex h-full min-h-0 flex-col text-on-surface">
	<div class="mx-auto w-full max-w-lg shrink-0 px-4 pt-3 pb-4">
		<SegmentedControl
			segments={tabSegments}
			value={activeTab}
			onValueChange={(val) => (activeTab = val as 'installed' | 'official')}
		/>
	</div>

	{#if activeTab === 'installed'}
		<div class="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
			<section class="ui-section">
				<div class="flex items-center justify-between px-1">
					<h3 class="text-label-large font-medium text-on-surface">
						{hostT('plugins.builtin.heading')}
					</h3>
					<span class="text-label-small text-on-surface-variant"
						>{hostT('plugins.builtin.count', {
							count: profileBuiltinPlugins.length
						})}</span
					>
				</div>

				<div class="ui-section-surface divide-y divide-border/40">
					{#each profileBuiltinPlugins as plugin (plugin.id)}
						{@const name = resolveManifestText(plugin.name)}
						{@const desc = resolveManifestText(plugin.description)}
						{@const meta = getPluginCategoryMeta(plugin.category)}
						<div
							class="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-surface-variant/30"
						>
							<div class="flex min-w-0 flex-1 flex-col justify-center">
								<div class="flex flex-wrap items-center gap-1.5">
									<span class="text-body-medium line-clamp-1 font-medium text-on-surface">
										{name}
									</span>
									{#if plugin.version}
										<span class="text-label-small font-mono text-[10px] text-on-surface-variant">
											v{plugin.version}
										</span>
									{/if}
									<span
										class="text-label-small py-0.2 rounded-full px-1.5 text-[10px] font-medium {meta.badgeClass}"
									>
										{meta.label}
									</span>
								</div>
								{#if desc}
									<p class="text-body-small mt-0.5 line-clamp-1 text-on-surface-variant">{desc}</p>
								{/if}
							</div>
							<div class="flex shrink-0 items-center gap-1.5">
								{#if plugin.configSchema}
									<Button
										variant="outlined"
										class="h-7.5 px-2.5 text-xs font-normal"
										onclick={() => handleOpenConfig(plugin.id, name, plugin.configSchema)}
									>
										<TuneFill class="mr-1 size-3.5" />
										{hostT('plugins.action.settings')}
									</Button>
								{:else}
									<span class="text-label-small text-[11px] text-on-surface-variant/80">
										{hostT('plugins.builtin.defaultEnabled')}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="ui-section">
				<div class="flex items-center justify-between px-1">
					<h3 class="text-label-large font-medium text-on-surface">
						{hostT('plugins.installed.heading')}
					</h3>
					<span class="text-label-small text-on-surface-variant"
						>{hostT('plugins.builtin.count', {
							count: installedRecords.length
						})}</span
					>
				</div>

				{#if installedRecords.length === 0}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-4 py-8 text-center text-on-surface-variant"
					>
						<p class="text-body-medium">{hostT('plugins.empty.installed')}</p>
						<div class="mt-2 flex flex-wrap items-center justify-center gap-2">
							<Button variant="text" class="text-xs" onclick={() => (activeTab = 'official')}>
								{hostT('plugins.empty.browse')}
							</Button>
							<Button variant="outlined" class="text-xs" onclick={promptLinkInstall}>
								{hostT('plugins.link.open')}
							</Button>
						</div>
					</div>
				{:else}
					<div class="ui-section-surface divide-y divide-border/40">
						{#each installedRecords as record (record.manifest.id)}
							{@const name = resolveManifestText(record.manifest.name)}
							{@const desc = resolveManifestText(record.manifest.description)}
							{@const meta = getPluginCategoryMeta(record.manifest.type)}
							{@const isBusy = operatingPluginId === record.manifest.id}
							<div
								class={[
									'flex flex-col gap-2 p-3 transition-colors hover:bg-surface-variant/30',
									!record.enabled && 'opacity-60'
								]}
							>
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0 flex-1">
										<div class="flex flex-wrap items-center gap-1.5">
											<span class="text-body-medium line-clamp-1 font-medium text-on-surface">
												{name}
											</span>
											{#if record.manifest.version}
												<span
													class="text-label-small font-mono text-[10px] text-on-surface-variant"
												>
													v{record.manifest.version}
												</span>
											{/if}
											<span
												class="text-label-small py-0.2 rounded-full px-1.5 text-[10px] font-medium {meta.badgeClass}"
											>
												{meta.label}
											</span>
											{#if isThemePluginInUse(record.manifest, record.enabled)}
												<span
													class="text-label-small py-0.2 rounded-full bg-primary-container/80 px-1.5 text-[10px] font-medium text-on-primary-container"
												>
													{hostT('plugins.badge.inUse')}
												</span>
											{/if}
										</div>
										{#if desc}
											<p class="text-body-small mt-0.5 line-clamp-1 text-on-surface-variant">
												{desc}
											</p>
										{/if}
										{#if record.manifest.author}
											<p class="text-caption mt-1 text-[10px] text-on-surface-variant/70">
												by {record.manifest.author}
											</p>
										{/if}
									</div>
								</div>

								<div class="flex items-center justify-between gap-2">
									<Button
										variant="text"
										class="h-6 shrink-0 px-1.5 text-[10px] text-error hover:bg-error/10"
										disabled={isBusy}
										onclick={() => promptUninstall(record.manifest.id, name)}
									>
										{hostT('common.uninstall')}
									</Button>

									<div class="flex shrink-0 items-center gap-1.5">
										{#if record.manifest.configSchema}
											<Button
												variant="outlined"
												class="h-7 px-2.5 text-[11px] font-normal"
												disabled={isBusy || !record.enabled}
												onclick={() =>
													handleOpenConfig(record.manifest.id, name, record.manifest.configSchema)}
											>
												<TuneFill class="mr-0.5 size-3" />
												{hostT('plugins.action.settings')}
											</Button>
										{/if}
										<span class="text-label-small text-[11px] text-on-surface-variant">
											{hostT('plugins.action.enable')}
										</span>
										<Switch
											size="sm"
											checked={record.enabled}
											disabled={isBusy}
											onCheckedChange={(checked) =>
												handleToggleEnabled(record.manifest.id, checked === true)}
										/>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	{:else}
		<div class="flex min-h-0 flex-1 flex-col">
			<div class="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
				<section class="ui-section">
					{#if loadingCatalog}
						<div class="flex flex-col items-center justify-center py-12">
							<LoadingIndicator size="large" />
							<p class="text-body-small mt-2 text-on-surface-variant">
								{hostT('plugins.catalog.loading')}
							</p>
						</div>
					{:else if catalogError}
						<div
							class="flex flex-col items-center justify-center rounded-2xl border border-error/30 bg-error-container/20 p-6 text-center"
						>
							<p class="text-body-medium font-medium text-error">
								{hostT('plugins.catalog.error.title')}
							</p>
							<p class="text-body-small mt-1 text-on-surface-variant">{catalogError}</p>
							<Button
								variant="outlined"
								class="mt-3 h-8 px-4 text-xs"
								onclick={loadOfficialCatalog}
							>
								{hostT('plugins.catalog.retry')}
							</Button>
						</div>
					{:else if catalogManifests.length === 0}
						<div
							class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-4 py-12 text-center text-on-surface-variant"
						>
							<p class="text-body-medium">{hostT('plugins.catalog.empty')}</p>
						</div>
					{:else}
						<div class="flex flex-col gap-5">
							{#each groupedCatalogManifests as group (group.category)}
								{@const groupMeta = getPluginCategoryMeta(group.category)}
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between px-1">
										<h3 class="text-label-large font-medium text-on-surface">
											{groupMeta.label}
										</h3>
										<span class="text-label-small text-on-surface-variant">
											{hostT('plugins.builtin.count', {
												count: group.entries.length
											})}
										</span>
									</div>
									<div class="ui-section-surface divide-y divide-border/40">
										{#each group.entries as entry (entry.manifest.id)}
											{@const manifest = entry.manifest}
											{@const name = resolveManifestText(manifest.name)}
											{@const desc = resolveManifestText(manifest.description)}
											{@const installed = isInstalled(manifest.id)}
											{@const isBusy = operatingPluginId === manifest.id}
											<div
												class="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-surface-variant/30"
											>
												<div class="flex min-w-0 flex-1 flex-col justify-center">
													<div class="flex flex-wrap items-center gap-1.5">
														<span class="text-body-medium line-clamp-1 font-medium text-on-surface">
															{name}
														</span>
														{#if manifest.version}
															<span
																class="text-label-small font-mono text-[10px] text-on-surface-variant"
															>
																v{manifest.version}
															</span>
														{/if}
													</div>
													{#if desc}
														<p class="text-body-small mt-0.5 line-clamp-1 text-on-surface-variant">
															{desc}
														</p>
													{/if}
													{#if manifest.author}
														<div class="mt-1 flex flex-wrap items-center gap-1">
															<span class="text-caption text-[10px] text-on-surface-variant/70">
																by {manifest.author}
															</span>
														</div>
													{/if}
												</div>

												<div class="flex shrink-0 flex-col items-end gap-1">
													{#if installed}
														<span
															class="inline-flex items-center gap-1 rounded-full bg-primary-container/50 px-2.5 py-1 text-xs font-medium text-primary"
														>
															<CheckCircleFill class="size-3.5" />
															{hostT('plugins.badge.installed')}
														</span>
													{:else}
														<Button
															variant="filled"
															class="h-8 shrink-0 px-3.5 text-xs font-medium"
															disabled={isBusy}
															onclick={() => handleInstall(manifest, entry.url)}
														>
															{isBusy
																? hostT('plugins.action.installing')
																: hostT('plugins.action.install')}
														</Button>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			</div>
			<ActionBottomBar>
				{@render linkImportFooter()}
			</ActionBottomBar>
		</div>
	{/if}
</div>

<PluginConfigModal
	bind:open={configModalOpen}
	pluginId={configModalData.id}
	pluginName={configModalData.name}
	schema={configModalData.schema}
/>

<Dialog
	bind:open={uninstallDialogOpen}
	title={hostT('plugins.uninstall.title')}
	description={hostT('plugins.uninstall.desc', {
		name: uninstallTarget.name || uninstallTarget.id
	})}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => (uninstallDialogOpen = false)}>
			{hostT('common.cancel')}
		</Button>
		<Button variant="danger" onclick={confirmUninstall}>
			{hostT('common.uninstall')}
		</Button>
	{/snippet}
</Dialog>

<Dialog bind:open={linkInstallDialogOpen} title={hostT('plugins.link.title')}>
	<div class="flex flex-col gap-3 py-2">
		<input
			class="text-body-medium w-full rounded-xl border border-border bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary disabled:opacity-60"
			type="url"
			placeholder={hostT('plugins.link.placeholder')}
			bind:value={manifestUrlInput}
			disabled={linkInstallInProgress}
		/>
		{#if linkInstallInProgress}
			<div class="flex items-center gap-2 text-on-surface-variant">
				<LoadingIndicator size="small" />
				<span class="text-body-small">{hostT('plugins.link.installing')}</span>
			</div>
		{/if}
	</div>
	{#snippet footer()}
		<Button
			variant="text"
			disabled={linkInstallInProgress}
			onclick={() => (linkInstallDialogOpen = false)}
		>
			{hostT('common.cancel')}
		</Button>
		<Button variant="filled" disabled={linkInstallInProgress} onclick={confirmLinkInstall}>
			{linkInstallInProgress ? hostT('plugins.action.installing') : hostT('plugins.link.confirm')}
		</Button>
	{/snippet}
</Dialog>
