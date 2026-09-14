<script lang="ts">
	import type { AppLocale } from '@chronos/core';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { parseMarkdown } from '$lib/content/markdown';
	import { trackEvent } from '$lib/client/analytics';
	import { getAppEngine, getAppController } from '$lib/services/app-engine';
	import { APP_LOCALES, applySessionAppLocale, normalizeAppLocale } from '$lib/i18n/locale-sync';
	import Radio from '$lib/components/ui/Radio.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { haptic } from '$lib/haptic/haptic';

	const controller = getAppController();
	const markdownContent = $derived(hostT('developer.markdown'));
	let htmlContent = $state('');

	const activeLocale = $derived(normalizeAppLocale(controller.currentLocale));

	$effect(() => {
		const markdown = markdownContent;
		void parseMarkdown(markdown).then((html) => {
			htmlContent = html;
		});
	});

	function localeLabel(locale: AppLocale): string {
		return hostT(locale === 'en' ? 'display.locale.en' : 'display.locale.zh-cn');
	}

	function selectLocale(locale: AppLocale) {
		haptic.light();
		trackEvent('settings_locale_change', { locale });
		applySessionAppLocale(getAppEngine(), locale);
	}
</script>

<div class="flex flex-col gap-5 px-4 py-2">
	<MineSection title={hostT('display.section.locale')}>
		{#each APP_LOCALES as option (option.id)}
			{@const selected = activeLocale === option.id}
			<MineRow label={true} title={localeLabel(option.id)} onclick={() => selectLocale(option.id)}>
				{#snippet trailing()}
					<Radio
						name="developer-app-locale"
						checked={selected}
						onchange={() => selectLocale(option.id)}
					/>
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>

	<div class="markdown-prose markdown-prose--developer prose prose-sm max-w-none dark:prose-invert">
		{@html htmlContent}
	</div>
</div>
