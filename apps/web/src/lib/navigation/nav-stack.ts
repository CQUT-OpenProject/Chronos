/** The only navigation record collection. Browser execution belongs to the coordinator. */
export type NavigationMarker = { session: string; id: string; position: number };
type FrameBase = NavigationMarker & { href: string };
export type RouteFrame = FrameBase & {
	kind: 'route';
	entry: 'normal' | 'deeplink';
	shellTab?: string;
};
export type OverlayFrame = FrameBase & {
	kind: 'overlay';
	overlayId: string;
	valid: boolean;
	onDismiss?: () => void;
};
export type NavFrame = RouteFrame | OverlayFrame;
export type NavigationSnapshot = {
	readonly records: readonly Readonly<NavFrame>[];
	readonly cursor: number;
};
let records: NavFrame[] = [];
let cursor = -1;
let serial = 0;
let session = '';

export function initNavStack(href: string, deepLink = false): void {
	session = `chronos-${Date.now()}-${++serial}`;
	cursor = 0;
	records = [
		{
			kind: 'route',
			session,
			id: `${session}-${++serial}`,
			position: 0,
			href,
			entry: deepLink ? 'deeplink' : 'normal'
		}
	];
}
export function getNavigationSnapshot(): NavigationSnapshot {
	return { records: records.map((frame) => ({ ...frame })), cursor };
}
export function getTopFrame(): NavFrame | undefined {
	return records[cursor];
}
export function getTopRoute(): RouteFrame | undefined {
	for (let i = cursor; i >= 0; i--)
		if (records[i].kind === 'route') return records[i] as RouteFrame;
}
export function findRecord(marker?: NavigationMarker): NavFrame | undefined {
	return (
		marker &&
		records.find(
			(frame) =>
				frame.session === marker.session &&
				frame.id === marker.id &&
				frame.position === marker.position
		)
	);
}
export function moveToRecord(frame: NavFrame): void {
	cursor = records.indexOf(frame);
}
export function markerFor(frame: NavFrame): NavigationMarker {
	return { session: frame.session, id: frame.id, position: frame.position };
}
export function pushRoute(href: string, replace = false): RouteFrame {
	const current = getTopFrame();
	const frame: RouteFrame = {
		kind: 'route',
		session,
		id: `${session}-${++serial}`,
		position: replace ? (current?.position ?? 0) : (current?.position ?? -1) + 1,
		href,
		entry: replace && current?.kind === 'route' ? current.entry : 'normal'
	};
	if (replace && current) records[cursor] = frame;
	else {
		records = records.slice(0, cursor + 1);
		records.push(frame);
		cursor++;
	}
	return frame;
}
export function pushOverlay(overlayId: string, onDismiss: () => void): OverlayFrame {
	const current = getTopFrame();
	const frame: OverlayFrame = {
		kind: 'overlay',
		session,
		id: `${session}-${++serial}`,
		position: (current?.position ?? -1) + 1,
		href: current?.href ?? '/',
		overlayId,
		valid: true,
		onDismiss
	};
	records = records.slice(0, cursor + 1);
	records.push(frame);
	cursor++;
	return frame;
}
/** Invalidate before calling UI callbacks so reentrant close/dispose is harmless. */
export function invalidateOverlays(predicate: (frame: OverlayFrame) => boolean): void {
	const dismissed: Array<() => void> = [];
	for (const frame of records) {
		if (frame.kind !== 'overlay' || !frame.valid || !predicate(frame)) continue;
		frame.valid = false;
		if (frame.onDismiss) dismissed.push(frame.onDismiss);
		frame.onDismiss = undefined;
	}
	for (const dismiss of dismissed.reverse()) dismiss();
}
