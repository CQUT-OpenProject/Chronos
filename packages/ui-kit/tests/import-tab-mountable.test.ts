import { describe, it, expect } from 'vite-plus/test';
import { CHRONOS_MOUNTABLE, mountableSvelteComponent } from '@chronos/ui-kit';
import type { ImportTabComponentProps } from '@chronos/ui-kit';
import ShareLinkImportTab from '../../plugins/codec-share/src/ShareLinkImportTab.svelte';

describe('ImportTab mountable contract', () => {
	it('wraps share-link import tab as a typed ChronosMountable', () => {
		const mountable = mountableSvelteComponent(ShareLinkImportTab);
		const props: ImportTabComponentProps = {
			transfer: {
				state: { errorMessage: null },
				previewWithSlot: async () => true
			},
			onContinue: () => {}
		};

		expect(mountable[CHRONOS_MOUNTABLE]).toBe(true);
		expect(typeof mountable.mount).toBe('function');
		void props;
	});
});
