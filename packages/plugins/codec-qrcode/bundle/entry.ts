import { mount, unmount } from 'svelte';
import { createQrCodecPlugin } from '../src/index';
import QrCodeImportTab from '../src/QrCodeImportTab.svelte';

export default createQrCodecPlugin({
	importComponent: {
		[Symbol.for('chronos.mountable')]: true as const,
		mount(target: HTMLElement, props: Record<string, unknown>) {
			const instance = mount(QrCodeImportTab, {
				target,
				props: props as never
			});
			return {
				unmount() {
					void unmount(instance);
				}
			};
		}
	}
});
