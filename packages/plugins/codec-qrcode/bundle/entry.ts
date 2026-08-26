import { mountableSvelteComponent } from '@chronos/ui-kit';
import { createQrCodecPlugin } from '../src/index';
import QrCodeImportTab from '../src/QrCodeImportTab.svelte';

export default createQrCodecPlugin({
	importComponent: mountableSvelteComponent(QrCodeImportTab)
});
