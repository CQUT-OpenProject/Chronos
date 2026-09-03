<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { fade } from 'svelte/transition';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import { onboardingController, ONBOARDING_STEP } from '$lib/client/onboarding.svelte';
	import type { TimetableLayoutMode } from '@chronos/core';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Radio from '$lib/components/ui/Radio.svelte';
	import AppHero from '$lib/components/AppHero.svelte';
	import HighlightRowList from '$lib/components/ui/HighlightRowList.svelte';
	import HighlightRow from '$lib/components/ui/HighlightRow.svelte';
	import InstallGuideCard from '$lib/components/pwa/InstallGuideCard.svelte';
	import {
		CheckCircleFill,
		DownloadFill,
		GavelFill,
		RocketLaunchFill,
		ShieldFill,
		WifiOffFill,
		ChevronRight
	} from '$lib/icons';
	import { haptic } from '$lib/haptic/haptic';

	const shell = getContext<AppShellController>('appShell');
	const step = $derived(onboardingController.step);
	const showOnboarding = $derived(onboardingController.isActive(page.url.pathname));
	const shouldRenderOnboarding = $derived(onboardingController.shouldRender(page.url.pathname));
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
		if (!showOnboarding) return;
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
		if (step === ONBOARDING_STEP.legal) {
			trackEvent('onboarding_legal_continue');
		} else {
			trackEvent('onboarding_step_next', { step });
		}
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

	function openLegalDocument(href: string) {
		haptic.light();
		void goto(href);
	}
</script>

{#snippet legalLinkCard(Icon: typeof GavelFill, title: string, description: string, href: string)}
	<button
		type="button"
		class="block w-full cursor-pointer border-none bg-transparent p-0 text-left"
		onclick={() => openLegalDocument(href)}
	>
		<Card variant="outlined" class="flex items-start gap-3.5">
			<span class="ui-leading-icon tone-primary" aria-hidden="true">
				<Icon />
			</span>
			<div class="flex min-w-0 flex-1 flex-col justify-center">
				<p class="text-body-large text-on-surface">{title}</p>
				<p class="text-body-small text-on-surface-variant">{description}</p>
			</div>
			<ChevronRight
				class="size-4.5 shrink-0 self-center text-on-surface-variant"
				aria-hidden="true"
			/>
		</Card>
	</button>
{/snippet}

{#if shouldRenderOnboarding}
	<div
		class="fixed inset-0 z-[85] flex flex-col bg-canvas text-ink outline-none"
		class:invisible={!showOnboarding}
		class:pointer-events-none={!showOnboarding}
		role="dialog"
		aria-modal="true"
		aria-labelledby={stepTitleId}
		aria-hidden={!showOnboarding}
		inert={!showOnboarding || undefined}
		tabindex="-1"
		{@attach dialogAttach}
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
						{#if step === ONBOARDING_STEP.welcome}
							<div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
								<AppHero
									title={hostT('onboarding.welcome.title')}
									subtitle={hostT('onboarding.welcome.subtitle')}
									titleId={stepTitleId}
								/>
							</div>
						{:else if step === ONBOARDING_STEP.legal}
							<div class="flex flex-1 flex-col justify-center gap-4">
								<h2
									id={stepTitleId}
									class="text-headline-small text-center font-semibold text-on-surface"
								>
									{hostT('onboarding.legal.title')}
								</h2>
								<p class="text-body-small text-center text-on-surface-variant">
									{hostT('onboarding.legal.subtitle')}
								</p>
								<div class="flex flex-col gap-3">
									{@render legalLinkCard(
										GavelFill,
										hostT('about.legal.terms'),
										hostT('onboarding.legal.terms.desc'),
										resolve('/legal/terms')
									)}
									{@render legalLinkCard(
										ShieldFill,
										hostT('about.legal.privacy'),
										hostT('onboarding.legal.privacy.desc'),
										resolve('/legal/privacy')
									)}
								</div>
								<p class="text-body-small text-center text-on-surface-variant">
									{hostT('legal.zhOnlyNotice')}
								</p>
							</div>
						{:else if step === ONBOARDING_STEP.highlights}
							<div class="flex flex-1 flex-col items-center justify-center gap-6">
								<h2
									id={stepTitleId}
									class="text-headline-small text-center font-semibold text-on-surface"
								>
									{hostT('onboarding.highlights.title')}
								</h2>
								<HighlightRowList>
									<HighlightRow
										icon={RocketLaunchFill}
										title={hostT('onboarding.highlights.plugins.title')}
										subtitle={hostT('onboarding.highlights.plugins.subtitle')}
									/>
									<HighlightRow
										icon={WifiOffFill}
										title={hostT('onboarding.highlights.offline.title')}
										subtitle={hostT('onboarding.highlights.offline.subtitle')}
									/>
									<HighlightRow
										icon={CheckCircleFill}
										title={hostT('onboarding.highlights.lightweight.title')}
										subtitle={hostT('onboarding.highlights.lightweight.subtitle')}
									/>
								</HighlightRowList>
							</div>
						{:else if step === ONBOARDING_STEP.layout}
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
						{:else if step === ONBOARDING_STEP.install}
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
							{step === ONBOARDING_STEP.legal
								? hostT('onboarding.legal.continue')
								: hostT('onboarding.next')}
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
