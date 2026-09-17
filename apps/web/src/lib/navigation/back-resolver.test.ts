import { describe, expect, it } from 'vite-plus/test';
import { resolveBack, resolveTraversal } from './back-resolver';
import type { NavigationSnapshot } from './nav-stack';
describe('pure back plans', () => {
	it('skips invalid overlays in both directions without changing its snapshot', () => {
		const snapshot: NavigationSnapshot = {
			records: [
				{ kind: 'route', id: 'a', session: 's', position: 0, href: '/', entry: 'normal' },
				{
					kind: 'overlay',
					id: 'b',
					session: 's',
					position: 1,
					href: '/',
					overlayId: 'sheet',
					valid: false
				},
				{ kind: 'route', id: 'c', session: 's', position: 2, href: '/about', entry: 'normal' }
			],
			cursor: 2
		};
		const before = structuredClone(snapshot);
		expect(resolveBack(snapshot, { kind: 'shell' })).toEqual({
			type: 'traverse',
			targetId: 'a',
			delta: -2
		});
		expect(resolveTraversal(snapshot, 'b')).toBe('a');
		expect(resolveTraversal({ ...snapshot, cursor: 0 }, 'b')).toBe('c');
		expect(snapshot).toEqual(before);
	});
});
