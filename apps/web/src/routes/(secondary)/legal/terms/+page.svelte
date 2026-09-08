<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { Pathname } from '$app/types';
	import type { BackFallback } from '$lib/navigation';
	import LegalDocumentScreen from '$lib/components/legal/LegalDocumentScreen.svelte';
	import { onboardingController } from '$lib/client/onboarding.svelte';

	const backFallback = $derived(
		(onboardingController.open
			? { kind: 'shell' as const }
			: { kind: 'route' as const, href: '/about' as Pathname }) satisfies BackFallback
	);
</script>

<LegalDocumentScreen
	title={hostT('route.terms')}
	{backFallback}
	documentPath="/legal/terms-of-service.md"
/>
