<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import LegalDocumentScreen from '$lib/components/legal/LegalDocumentScreen.svelte';
	import { onboardingController } from '$lib/client/onboarding.svelte';

	const backHref = $derived((onboardingController.open ? resolve('/') : '/about') as Pathname);
</script>

<LegalDocumentScreen
	title={hostT('route.terms')}
	{backHref}
	documentPath="/legal/terms-of-service.md"
/>
