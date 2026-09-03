<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import { trackEvent } from '$lib/client/analytics';
	import { onboardingController, ONBOARDING_STEP } from '$lib/client/onboarding.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const controller = getAppController();

	function handleImportClick() {
		trackEvent('empty_import_click');
	}

	function showImportGuide() {
		trackEvent('empty_import_guide_open');
		onboardingController.openAt(ONBOARDING_STEP.highlights);
	}
</script>

<div
	class="flex min-h-[calc(100dvh-var(--bottom-bar-height))] flex-col items-center justify-center gap-3 px-6 py-8 text-center"
>
	<img src={favicon} alt="" class="h-32 w-32" aria-hidden="true" />

	<p class="text-label-large text-brand">{hostT('timetable.empty.brand')}</p>
	<h2 class="text-headline-medium font-bold text-on-surface">
		{hostT('timetable.empty.title')}
	</h2>

	<div class="mt-4 flex flex-col items-center gap-3">
		<Button variant="outlined" href={resolve('/transfer/import')} onclick={handleImportClick}>
			{hostT('timetable.empty.import')}
		</Button>
		<button
			type="button"
			class="cursor-pointer text-sm font-medium text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
			onclick={showImportGuide}
		>
			{hostT('timetable.empty.guide')}
		</button>
	</div>
</div>
