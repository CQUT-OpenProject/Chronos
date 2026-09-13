<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import Switch from '$lib/components/ui/Switch.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { AnimationFill, MobileVibrateFill } from '$lib/icons';
	import { haptic } from '$lib/haptic/haptic';

	let { shell }: { shell: AppShellController } = $props();
	const hapticFeedbackEnabled = $derived(
		shell.controller.userPreferences?.hapticFeedbackEnabled ?? true
	);
	const reduceMotionEnabled = $derived(
		shell.controller.userPreferences?.reduceMotionEnabled ?? false
	);

	async function toggleHapticFeedback(checked: boolean) {
		trackEvent('settings_haptic_feedback_change', { enabled: checked });
		await shell.setHapticFeedbackEnabled(checked);
		if (checked) {
			haptic.light();
		}
	}

	async function toggleReduceMotion(checked: boolean) {
		trackEvent('settings_reduce_motion_change', { enabled: checked });
		await shell.setReduceMotionEnabled(checked);
	}
</script>

<div class="flex flex-col gap-5">
	<MineSection title={hostT('mine.feedback.section.haptic')}>
		<MineRow
			label
			title={hostT('mine.feedback.haptic.label')}
			icon={MobileVibrateFill}
			iconTone="primary"
		>
			{#snippet trailing()}
				<Switch checked={hapticFeedbackEnabled} onCheckedChange={toggleHapticFeedback} />
			{/snippet}
		</MineRow>
	</MineSection>

	<MineSection title={hostT('mine.feedback.section.motion')}>
		<MineRow
			label
			title={hostT('mine.feedback.motion.label')}
			icon={AnimationFill}
			iconTone="primary"
		>
			{#snippet trailing()}
				<Switch checked={reduceMotionEnabled} onCheckedChange={toggleReduceMotion} />
			{/snippet}
		</MineRow>
	</MineSection>
</div>
