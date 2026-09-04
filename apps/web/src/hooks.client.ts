import { ensurePwaSwRegistered } from '$lib/client/pwa-sw';
import { initPwaUpdateUx } from '$lib/client/pwa-update-ux.svelte';
import '$lib/client/pwa-install.svelte';

ensurePwaSwRegistered();
initPwaUpdateUx();
