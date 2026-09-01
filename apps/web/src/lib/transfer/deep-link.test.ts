import { describe, expect, it } from 'vite-plus/test';
import type { ImportTabSlotContribution } from '@chronos/core';
import { resolveDeepLinkImport } from './deep-link';

function makeTab(
	id: string,
	fromLocation?: ImportTabSlotContribution['deepLink']
): ImportTabSlotContribution {
	return {
		id,
		title: id,
		executeImport: async () => {
			throw new Error('not implemented');
		},
		...(fromLocation ? { deepLink: fromLocation } : {})
	};
}

const location = { hash: '#payload', search: '?d=x' };

describe('resolveDeepLinkImport', () => {
	it('returns null when no tab claims the location', () => {
		const tabs = [makeTab('a'), makeTab('b')];
		expect(resolveDeepLinkImport(tabs, location)).toBeNull();
	});

	it('dispatches to the claiming tab with its inputs', () => {
		const tabs = [
			makeTab('a'),
			makeTab('share-link', {
				fromLocation: (loc) => (loc.hash === '#payload' ? { content: 'p' } : null)
			})
		];
		const match = resolveDeepLinkImport(tabs, location);
		expect(match?.tab.id).toBe('share-link');
		expect(match?.inputs).toEqual({ content: 'p' });
	});

	it('skips tabs that return null and keeps scanning', () => {
		const tabs = [
			makeTab('first', { fromLocation: () => null }),
			makeTab('second', { fromLocation: () => ({ ok: true }) })
		];
		expect(resolveDeepLinkImport(tabs, location)?.tab.id).toBe('second');
	});
});
