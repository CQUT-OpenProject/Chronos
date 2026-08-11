<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import Button from '$lib/components/ui/Button.svelte';
	import { onboardingController } from '$lib/client/onboarding.svelte';

	function showImportGuide() {
		onboardingController.openAt(3);
	}
</script>

<div
	class="flex min-h-[calc(100dvh-var(--bottom-bar-height))] flex-col items-center justify-center gap-3 px-6 py-8 text-center"
>
	<img src={favicon} alt="" class="h-32 w-32" aria-hidden="true" />

	<p class="m3-label-large text-brand">Chronos</p>
	<h2 class="m3-headline-medium font-bold text-on-surface">还没有课程表</h2>

	<div class="mt-4 flex flex-col items-center gap-3">
		<Button variant="outlined" href={resolve('/transfer/import')}>导入课程表</Button>
		<button
			type="button"
			class="cursor-pointer text-sm font-medium text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
			onclick={showImportGuide}
		>
			查看导入方式说明
		</button>
	</div>
</div>
