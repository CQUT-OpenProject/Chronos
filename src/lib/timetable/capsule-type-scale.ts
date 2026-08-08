export interface CapsuleTypeScale {
	titlePx: number;
	detailPx: number;
	badgePx: number;
	placeholderPx: number;
}

/** Hide “xx校区” when effective column width is below this. */
export const HIDE_LOCATION_CAMPUS_BELOW_PX = 70;

export function shouldShowLocationCampus(columnWidthPx: number, overlapCount = 1): boolean {
	const overlap = Math.max(1, overlapCount);
	const effective = Math.max(0, columnWidthPx) / overlap;
	return effective >= HIDE_LOCATION_CAMPUS_BELOW_PX;
}

/** leading-tight ≈ 1.25 — used to reserve location height in px. */
const LOCATION_LINE_HEIGHT_RATIO = 1.25;
/** Extra px for building/room when campus row is dropped. */
const LOCATION_FONT_BUMP_PX = 2;

/**
 * Location block sizing: when campus is hidden for width, keep a 3-line slot
 * (so the course title does not grow) and bump building/room type size.
 */
export function resolveLocationBlockMetrics(
	detailPx: number,
	showCampus: boolean,
	visibleLineCount: number
): { fontPx: number; heightPx: number } {
	const reservedLines = showCampus ? Math.min(Math.max(visibleLineCount, 1), 3) : 3;
	const fontPx = roundPx(showCampus ? detailPx : detailPx + LOCATION_FONT_BUMP_PX);
	const heightPx = reservedLines * detailPx * LOCATION_LINE_HEIGHT_RATIO;
	return { fontPx, heightPx };
}

/** Width (px) → font-size (px) anchors, sorted ascending by width. */
const TITLE_ANCHORS: ReadonlyArray<readonly [number, number]> = [
	[50, 12],
	[70, 14],
	[85, 15],
	[110, 17]
];

const DETAIL_ANCHORS: ReadonlyArray<readonly [number, number]> = [
	[50, 8],
	[70, 10],
	[85, 11],
	[110, 12]
];

const BADGE_ANCHORS: ReadonlyArray<readonly [number, number]> = [
	[50, 8],
	[70, 9],
	[85, 10],
	[110, 12]
];

function lerpAnchors(
	effectivePx: number,
	anchors: ReadonlyArray<readonly [number, number]>
): number {
	const first = anchors[0]!;
	const last = anchors[anchors.length - 1]!;
	if (effectivePx <= first[0]) return first[1];
	if (effectivePx >= last[0]) return last[1];

	for (let index = 1; index < anchors.length; index += 1) {
		const [x0, y0] = anchors[index - 1]!;
		const [x1, y1] = anchors[index]!;
		if (effectivePx <= x1) {
			const t = (effectivePx - x0) / (x1 - x0);
			return y0 + t * (y1 - y0);
		}
	}
	return last[1];
}

function roundPx(value: number): number {
	return Math.round(value * 10) / 10;
}

/**
 * Map column content width (+ overlap) to capsule type sizes.
 * `columnWidthPx` is one day column; overlap narrows the effective width.
 */
export function resolveCapsuleTypeScale(columnWidthPx: number, overlapCount = 1): CapsuleTypeScale {
	const overlap = Math.max(1, overlapCount);
	const effective = Math.max(0, columnWidthPx) / overlap;

	const titlePx = roundPx(lerpAnchors(effective, TITLE_ANCHORS));
	const detailPx = roundPx(lerpAnchors(effective, DETAIL_ANCHORS));
	const badgePx = roundPx(lerpAnchors(effective, BADGE_ANCHORS));
	const placeholderPx = roundPx(Math.max(11, titlePx - 1));

	return { titlePx, detailPx, badgePx, placeholderPx };
}
