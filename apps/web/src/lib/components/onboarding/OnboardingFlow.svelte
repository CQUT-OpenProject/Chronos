<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { fade } from 'svelte/transition';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import { onboardingController } from '$lib/client/onboarding.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import {
		buildImportDescription,
		buildOnboardingImportHighlight,
		defaultImportMethodSubtitle,
		formatImportMethodTitle
	} from '$lib/transfer/import-slot-capabilities';
	import type { TimetableLayoutMode } from '@chronos/core';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Radio from '$lib/components/ui/Radio.svelte';
	import AppHero from '$lib/components/AppHero.svelte';
	import HighlightRowList from '$lib/components/ui/HighlightRowList.svelte';
	import HighlightRow from '$lib/components/ui/HighlightRow.svelte';
	import InstallGuideCard from '$lib/components/pwa/InstallGuideCard.svelte';
	import {
		DownloadFill,
		PaletteFill,
		WifiOffFill,
		IosShareFill,
		DescriptionFill
	} from '$lib/icons';
	import { haptic } from '$lib/haptic/haptic';

	const shell = getContext<AppShellController>('appShell');
	const controller = getAppController();
	const importSlots = $derived(controller.getSlots('import.source.tab'));
	const onboardingImportHighlight = $derived(buildOnboardingImportHighlight(importSlots));
	const step = $derived(onboardingController.step);
	const stepIndices = [0, 1, 2, 3, 4, 5] as const;
	const isLastStep = $derived(step === onboardingController.totalSteps - 1);
	const stepTitleId = 'onboarding-step-title';
	const layoutMode = $derived(shell.controller.userPreferences?.timetableLayoutMode ?? 'fixed');

	const layoutOptions = $derived.by(() => {
		return [
			{
				mode: 'fixed' as const,
				label: hostT('onboarding.layout.fixed.label'),
				description: hostT('onboarding.layout.fixed.desc')
			},
			{
				mode: 'compact' as const,
				label: hostT('onboarding.layout.compact.label'),
				description: hostT('onboarding.layout.compact.desc')
			}
		] as const;
	});

	$effect(() => {
		if (!onboardingController.open) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	});

	function dialogAttach(node: HTMLElement) {
		const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
		const getFocusable = () =>
			[...node.querySelectorAll<HTMLElement>(selector)].filter(
				(el) => !el.hasAttribute('disabled')
			);

		function onKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.preventDefault();
				completeOnboarding();
				return;
			}
			if (event.key !== 'Tab') return;
			const elements = getFocusable();
			if (elements.length === 0) return;
			const first = elements[0];
			const last = elements[elements.length - 1];
			const active = document.activeElement;
			if (event.shiftKey && (active === first || active === node)) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}
		}

		node.addEventListener('keydown', onKeydown);
		queueMicrotask(() => node.focus());

		return () => node.removeEventListener('keydown', onKeydown);
	}

	function prefersReducedMotion() {
		return (
			typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	const stepTransitionDuration = $derived(prefersReducedMotion() ? 1 : 200);

	function handleNext() {
		trackEvent('onboarding_step_next', { step });
		haptic.light();
		onboardingController.next();
	}

	function handleBack() {
		trackEvent('onboarding_step_back', { step });
		haptic.light();
		onboardingController.back();
	}

	function completeOnboarding() {
		onboardingController.finish();
	}

	function handleStartImport() {
		trackEvent('onboarding_start_import');
		completeOnboarding();
		void goto(resolve('/transfer/import'));
	}

	function handleLater() {
		trackEvent('onboarding_skip', { step });
		haptic.light();
		completeOnboarding();
	}

	async function selectLayoutMode(mode: TimetableLayoutMode) {
		trackEvent('onboarding_layout_selected', { mode });
		haptic.light();
		await shell.setTimetableLayoutMode(mode);
	}
</script>

{#snippet importMethodCard(Icon: typeof DownloadFill, title: string, description: string)}
	<Card variant="outlined" class="flex items-start gap-3.5">
		<span class="ui-leading-icon tone-primary" aria-hidden="true">
			<Icon />
		</span>
		<div class="flex min-w-0 flex-1 flex-col justify-center">
			<p class="text-body-large text-on-surface">{title}</p>
			<p class="text-body-small text-on-surface-variant">{description}</p>
		</div>
	</Card>
{/snippet}

{#if onboardingController.open}
	<div
		class="fixed inset-0 z-[85] flex flex-col bg-canvas text-ink outline-none"
		role="dialog"
		aria-modal="true"
		aria-labelledby={stepTitleId}
		tabindex="-1"
		{@attach dialogAttach}
		transition:fade={{ duration: stepTransitionDuration }}
	>
		<div class="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col">
			<div
				class="flex items-center justify-end gap-2 px-4 pb-2"
				style:padding-top="calc(var(--topbar-safe) + 0.75rem)"
			>
				<button
					type="button"
					class="cursor-pointer text-sm font-medium text-on-surface-variant hover:text-on-surface"
					onclick={handleLater}
				>
					{hostT('onboarding.skip')}
				</button>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
				{#key step}
					<div
						class="flex h-full flex-col"
						in:fade={{ duration: stepTransitionDuration, delay: stepTransitionDuration }}
						out:fade={{ duration: stepTransitionDuration }}
					>
						{#if step === 0}
							<div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
								<AppHero
									title={hostT('onboarding.welcome.title')}
									subtitle={hostT('onboarding.welcome.subtitle')}
									titleId={stepTitleId}
								/>
							</div>
						{:else if step === 1}
							<div class="flex flex-1 flex-col items-center justify-center gap-6">
								<h2
									id={stepTitleId}
									class="text-headline-small text-center font-semibold text-on-surface"
								>
									{hostT('onboarding.highlights.title')}
								</h2>
								<HighlightRowList>
									<HighlightRow
										icon={DownloadFill}
										title={hostT('onboarding.highlights.import.title')}
										subtitle={onboardingImportHighlight}
									/>
									<HighlightRow
										icon={PaletteFill}
										title={hostT('onboarding.highlights.theme.title')}
										subtitle={hostT('onboarding.highlights.theme.subtitle')}
									/>
									<HighlightRow
										icon={WifiOffFill}
										title={hostT('onboarding.highlights.offline.title')}
										subtitle={hostT('onboarding.highlights.offline.subtitle')}
									/>
								</HighlightRowList>
							</div>
						{:else if step === 2}
							<div class="flex flex-1 flex-col justify-center gap-4">
								<h2
									id={stepTitleId}
									class="text-headline-small text-center font-semibold text-on-surface"
								>
									{hostT('onboarding.layout.title')}
								</h2>
								<p class="text-body-small text-center text-on-surface-variant">
									{hostT('onboarding.layout.hint')}
								</p>
								<div class="flex flex-col gap-3">
									{#each layoutOptions as option (option.mode)}
										{@const selected = layoutMode === option.mode}
										<label class="block w-full cursor-pointer">
											<Card
												variant="outlined"
												class="flex items-start gap-3.5 {selected
													? 'border-brand ring-1 ring-brand'
													: ''}"
											>
												<div class="flex min-w-0 flex-1 flex-col justify-center">
													<p class="text-body-large text-on-surface">{option.label}</p>
													<p class="text-body-small text-on-surface-variant">
														{option.description}
													</p>
												</div>
												<div class="flex shrink-0 items-center self-center">
													<Radio
														name="onboarding-layout-mode"
														checked={selected}
														onchange={() => selectLayoutMode(option.mode)}
													/>
												</div>
											</Card>
										</label>
									{/each}
								</div>
							</div>
						{:else if step === 3}
							<div class="flex flex-1 flex-col justify-center gap-4">
								<h2
									id={stepTitleId}
									class="text-headline-small text-center font-semibold text-on-surface"
								>
									{hostT('onboarding.import.title')}
								</h2>
								<div class="flex flex-col gap-3">
									{#each importSlots as slot (slot.id)}
										{@const icon =
											slot.importKind === 'online'
												? DownloadFill
												: slot.importKind === 'file'
													? DescriptionFill
													: IosShareFill}
										{@render importMethodCard(
											icon,
											formatImportMethodTitle(slot),
											defaultImportMethodSubtitle(slot)
										)}
									{/each}
								</div>
							</div>
						{:else if step === 4}
							<div class="flex flex-1 flex-col justify-center gap-4">
								<h2
									id={stepTitleId}
									class="text-headline-small text-center font-semibold text-on-surface"
								>
									{hostT('onboarding.install.title')}
								</h2>
								<p class="text-body-small text-center text-on-surface-variant">
									{hostT('onboarding.install.subtitle')}
								</p>
								<InstallGuideCard inOnboarding />
							</div>
						{:else}
							<div class="flex flex-1 flex-col items-center justify-center gap-3 text-center">
								<div
									class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 text-brand"
								>
									<DownloadFill class="h-8 w-8" />
								</div>
								<h2 id={stepTitleId} class="text-headline-small font-semibold text-on-surface">
									{hostT('onboarding.done.title')}
								</h2>
								<p class="text-body-medium text-on-surface-variant">
									{hostT('onboarding.done.subtitle')}
								</p>
							</div>
						{/if}
					</div>
				{/key}
			</div>

			<div
				class="flex flex-col gap-4 px-6 pt-2"
				style:padding-bottom="calc(var(--tabbar-safe) + 1.25rem)"
			>
				<ol
					class="flex list-none justify-center gap-1.5"
					aria-label={hostT('onboarding.steps.aria')}
				>
					{#each stepIndices as stepIndex (stepIndex)}
						<li
							class="h-1.5 w-6 rounded-full transition-colors {stepIndex <= step
								? 'bg-brand dark:bg-soft-blue'
								: 'bg-outline-variant'}"
							aria-current={stepIndex === step ? 'step' : undefined}
							aria-label={hostT('onboarding.steps.label', {
								current: stepIndex + 1,
								total: stepIndices.length
							})}
						></li>
					{/each}
				</ol>
				<div class="flex gap-3">
					{#if !isLastStep}
						{#if step > 0}
							<Button variant="text" class="flex-1" onclick={handleBack}>
								{hostT('onboarding.back')}
							</Button>
						{/if}
						<Button variant="filled" class="flex-1" onclick={handleNext}>
							{hostT('onboarding.next')}
						</Button>
					{:else}
						<Button variant="text" class="flex-1" onclick={handleLater}>
							{hostT('onboarding.later')}
						</Button>
						<Button variant="filled" class="flex-1" onclick={handleStartImport}>
							{hostT('onboarding.startImport')}
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
