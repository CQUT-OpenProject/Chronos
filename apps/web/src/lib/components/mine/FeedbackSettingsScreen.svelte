<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import Switch from '$lib/components/ui/Switch.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { MobileVibrateFill } from '$lib/icons';
	import { haptic } from '$lib/haptic/haptic';

	let { shell }: { shell: AppShellController } = $props();
	const hapticFeedbackEnabled = $derived(
		shell.controller.userPreferences?.hapticFeedbackEnabled ?? true
	);

	async function toggleHapticFeedback(checked: boolean) {
		trackEvent('settings_haptic_feedback_change', { enabled: checked });
		await shell.setHapticFeedbackEnabled(checked);
		if (checked) {
			haptic.light();
		}
	}
</script>

<div class="flex flex-col gap-5">
	<MineSection title={hostT('mine.feedback.section.haptic')}>
		<MineRow
			label={true}
			title={hostT('mine.feedback.haptic.label')}
			icon={MobileVibrateFill}
			iconTone="primary"
			onclick={() => toggleHapticFeedback(!hapticFeedbackEnabled)}
		>
			{#snippet trailing()}
				<Switch checked={hapticFeedbackEnabled} onCheckedChange={toggleHapticFeedback} />
			{/snippet}
		</MineRow>
	</MineSection>
</div>
