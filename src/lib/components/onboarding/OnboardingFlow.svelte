<script lang="ts">
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onboardingController } from '$lib/client/onboarding.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
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

	const step = $derived(onboardingController.step);
	const stepIndices = [0, 1, 2, 3, 4] as const;
	const isLastStep = $derived(step === onboardingController.totalSteps - 1);
	const stepTitleId = 'onboarding-step-title';

	function suppressInstallPrompts() {
		pwaInstallController.cancelScheduledDialog();
		pwaInstallController.dismiss();
	}

	$effect(() => {
		if (!onboardingController.open) return;
		suppressInstallPrompts();
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
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}

		node.addEventListener('keydown', onKeydown);
		queueMicrotask(() => getFocusable()[0]?.focus());

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
		vibrate();
		onboardingController.next();
	}

	function handleBack() {
		vibrate();
		onboardingController.back();
	}

	function completeOnboarding() {
		suppressInstallPrompts();
		onboardingController.finish();
	}

	function handleStartImport() {
		completeOnboarding();
		void goto(resolve('/transfer/import'));
	}

	function handleLater() {
		vibrate();
		completeOnboarding();
	}
</script>

{#snippet importMethodCard(Icon: typeof DownloadFill, title: string, description: string)}
	<Card variant="outlined" class="flex items-start gap-3.5">
		<div
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"
		>
			<Icon class="h-5 w-5" />
		</div>
		<div class="flex min-w-0 flex-1 flex-col justify-center">
			<p class="m3-body-large text-on-surface">{title}</p>
			<p class="m3-body-small text-on-surface-variant">{description}</p>
		</div>
	</Card>
{/snippet}

{#if onboardingController.open}
	<div
		class="fixed inset-0 z-[85] flex flex-col bg-canvas text-ink"
		role="dialog"
		aria-modal="true"
		aria-labelledby={stepTitleId}
		{@attach dialogAttach}
		transition:fade={{ duration: stepTransitionDuration }}
	>
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
									subtitle="知行理工在线导入、分享链接、HTML 文件均可"
								/>
								<HighlightRow
									icon={PaletteFill}
									title="自定义主题与壁纸"
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
								如何导入课表？
							</h2>
							<div class="flex flex-col gap-3">
								{@render importMethodCard(
									DownloadFill,
									'知行理工在线导入',
									'输入学号与密码，在线抓取课表'
								)}
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
					{:else if step === 3}
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
							<InstallGuideCard />
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
				{#each stepIndices as index (index)}
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
{/if}
