<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import LegalDocumentScreen from '$lib/components/legal/LegalDocumentScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';

	const controller = getAppController();
</script>

<LegalDocumentScreen
	title={hostT('route.privacy')}
	backHref="/about"
	documentPath="/legal/privacy-policy.md"
/>
