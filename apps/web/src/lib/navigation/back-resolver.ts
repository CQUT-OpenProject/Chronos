import type { NavigationSnapshot, NavFrame } from './nav-stack';
export type BackFallback = { kind: 'shell'; tab?: string } | { kind: 'route'; href: string };
export type BackPlan =
	| { type: 'traverse'; targetId: string; delta: number }
	| { type: 'fallback'; fallback: BackFallback };
export function isValidTarget(frame: Readonly<NavFrame>): boolean {
	return frame.kind === 'route' || frame.valid;
}
export function resolveBack(snapshot: NavigationSnapshot, fallback: BackFallback): BackPlan {
	const current = snapshot.records[snapshot.cursor];
	if (current && !(current.kind === 'route' && current.entry === 'deeplink')) {
		for (let i = snapshot.cursor - 1; i >= 0; i--) {
			const frame = snapshot.records[i];
			if (isValidTarget(frame))
				return { type: 'traverse', targetId: frame.id, delta: frame.position - current.position };
		}
	}
	return { type: 'fallback', fallback };
}
/** Closed overlays cannot be resurrected by browser forward. */
export function resolveTraversal(
	snapshot: NavigationSnapshot,
	targetId: string
): string | undefined {
	const target = snapshot.records.findIndex((frame) => frame.id === targetId);
	if (target < 0) return undefined;
	if (isValidTarget(snapshot.records[target])) return targetId;
	const direction = target > snapshot.cursor ? 1 : -1;
	for (let i = target + direction; i >= 0 && i < snapshot.records.length; i += direction) {
		if (isValidTarget(snapshot.records[i])) return snapshot.records[i].id;
	}
	const current = snapshot.records[snapshot.cursor];
	if (current && isValidTarget(current)) return current.id;
	for (let i = snapshot.cursor - 1; i >= 0; i--)
		if (isValidTarget(snapshot.records[i])) return snapshot.records[i].id;
}
