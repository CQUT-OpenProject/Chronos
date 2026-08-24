<script lang="ts">
	import LegalDocumentScreen from '$lib/components/legal/LegalDocumentScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

<LegalDocumentScreen
	title={hostTextRead(controller, 'route.terms')}
	backHref="/about"
	documentPath="/legal/terms-of-service.md"
/>
