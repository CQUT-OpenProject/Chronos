<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import { onboardingController } from '$lib/client/onboarding.svelte';
	import { onlineImportEnabled } from '$lib/config/features';
	import { TimetableLayoutMode } from '$lib/models/app-state';
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

	const shell = getContext<AppShellController>('appShell');
	const step = $derived(onboardingController.step);
	const stepIndices = [0, 1, 2, 3, 4, 5] as const;
	const isLastStep = $derived(step === onboardingController.totalSteps - 1);
	const stepTitleId = 'onboarding-step-title';
	const layoutMode = $derived(shell.state.appState.timetableLayoutMode);

	const layoutOptions = [
		{
			mode: TimetableLayoutMode.SCROLL,
			label: '滚动查看',
			description: '上下滚动查看全天课程，字体更大'
		},
		{
			mode: TimetableLayoutMode.FIT,
			label: '一屏显示',
			description: '一屏展示全天课程，无需滚动'
		}
	] as const;

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

	function vibrate() {
		navigator.vibrate?.(10);
	}

	function handleNext() {
		trackEvent('onboarding_step_next', { step });
		vibrate();
		onboardingController.next();
	}

	function handleBack() {
		trackEvent('onboarding_step_back', { step });
		vibrate();
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
		vibrate();
		completeOnboarding();
	}

	async function selectLayoutMode(mode: TimetableLayoutMode) {
		trackEvent('onboarding_layout_selected', { mode });
		vibrate();
		await shell.setTimetableLayoutMode(mode);
	}
</script>

{#snippet importMethodCard(Icon: typeof DownloadFill, title: string, description: string)}
	<Card variant="outlined" class="flex items-start gap-3.5">
		<span class="m3-leading-icon tone-primary" aria-hidden="true">
			<Icon />
		</span>
		<div class="flex min-w-0 flex-1 flex-col justify-center">
			<p class="m3-body-large text-on-surface">{title}</p>
			<p class="m3-body-small text-on-surface-variant">{description}</p>
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
					跳过
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
									title="欢迎使用 Chronos"
									subtitle="无广告 · 轻量化的课表体验"
									titleId={stepTitleId}
								/>
							</div>
						{:else if step === 1}
							<div class="flex flex-1 flex-col items-center justify-center gap-6">
								<h2
									id={stepTitleId}
									class="m3-headline-small text-center font-semibold text-on-surface"
								>
									功能亮点
								</h2>
								<HighlightRowList>
									<HighlightRow
										icon={DownloadFill}
										title="多种导入方式"
										subtitle={onlineImportEnabled
											? '知行理工在线导入、分享链接、HTML 文件均可'
											: '分享链接、HTML 文件均可导入'}
									/>
									<HighlightRow
										icon={PaletteFill}
										title="主题与壁纸"
										subtitle="浅色、深色或跟随系统，还能设置课表壁纸"
									/>
									<HighlightRow
										icon={WifiOffFill}
										title="完全离线可用"
										subtitle="自动本地缓存，断网无网状态下仍可查课表"
									/>
								</HighlightRowList>
							</div>
						{:else if step === 2}
							<div class="flex flex-1 flex-col justify-center gap-4">
								<h2
									id={stepTitleId}
									class="m3-headline-small text-center font-semibold text-on-surface"
								>
									选择主页显示样式
								</h2>
								<p class="m3-body-small text-center text-on-surface-variant">
									可随时在「显示设置」中更改。
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
													<p class="m3-body-large text-on-surface">{option.label}</p>
													<p class="m3-body-small text-on-surface-variant">
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
									class="m3-headline-small text-center font-semibold text-on-surface"
								>
									如何导入课表？
								</h2>
								<div class="flex flex-col gap-3">
									{#if onlineImportEnabled}
										{@render importMethodCard(
											DownloadFill,
											'知行理工在线导入',
											'输入知行理工账号密码，获取在线课表'
										)}
									{/if}
									{@render importMethodCard(
										IosShareFill,
										'分享链接导入',
										'粘贴他人分享的课表链接即可导入'
									)}
									{@render importMethodCard(
										DescriptionFill,
										'HTML 文件导入',
										'从教务系统导出课表页面后，导入该 HTML 文件'
									)}
								</div>
							</div>
						{:else if step === 4}
							<div class="flex flex-1 flex-col justify-center gap-4">
								<h2
									id={stepTitleId}
									class="m3-headline-small text-center font-semibold text-on-surface"
								>
									安装到主屏幕
								</h2>
								<p class="m3-body-small text-center text-on-surface-variant">
									添加到主屏幕后可快捷打开，并支持离线使用。
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
								<h2 id={stepTitleId} class="m3-headline-small font-semibold text-on-surface">
									开始使用 Chronos
								</h2>
								<p class="m3-body-medium text-on-surface-variant">
									导入课程表后即可查看每周课程安排。
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
				<ol class="flex list-none justify-center gap-1.5" aria-label="引导步骤">
					{#each stepIndices as index}
						<li
							class="h-1.5 w-6 rounded-full transition-colors {index <= step
								? 'bg-brand dark:bg-soft-blue'
								: 'bg-outline-variant'}"
							aria-current={index === step ? 'step' : undefined}
							aria-label="第 {index + 1} 步，共 {stepIndices.length} 步"
						></li>
					{/each}
				</ol>
				<div class="flex gap-3">
					{#if !isLastStep}
						{#if step > 0}
							<Button variant="text" class="flex-1" onclick={handleBack}>上一步</Button>
						{/if}
						<Button variant="filled" class="flex-1" onclick={handleNext}>下一步</Button>
					{:else}
						<Button variant="text" class="flex-1" onclick={handleLater}>稍后再说</Button>
						<Button variant="filled" class="flex-1" onclick={handleStartImport}>开始导入</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
