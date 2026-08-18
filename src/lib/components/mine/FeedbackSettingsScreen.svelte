<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import Switch from '$lib/components/ui/Switch.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { MobileVibrateFill } from '$lib/icons';
	import { haptic } from '$lib/haptic/haptic';

	let { shell }: { shell: AppShellController } = $props();
	const hapticFeedbackEnabled = $derived(shell.state.appState.hapticFeedbackEnabled);

	async function toggleHapticFeedback(checked: boolean) {
		trackEvent('settings_haptic_feedback_change', { enabled: checked });
		await shell.setHapticFeedbackEnabled(checked);
		if (checked) {
			haptic.light();
		}
	}
</script>

<div class="flex flex-col gap-5">
	<MineSection title="触感反馈">
		<MineRow
			label={true}
			title="震动反馈"
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
