export type CapsulePagerPreviewTarget = {
	onPagerPreviewWeek(week: number | null): void;
};

/** Imperative bridge from the week pager to the capsule indicator (avoids parent reactivity). */
export function createCapsulePagerPreview() {
	let target: CapsulePagerPreviewTarget | null = null;
	let current: number | null = null;

	function attach(next: CapsulePagerPreviewTarget): void {
		target = next;
		if (current !== null) next.onPagerPreviewWeek(current);
	}

	function detach(): void {
		target = null;
	}

	function setPreview(week: number): void {
		current = week;
		target?.onPagerPreviewWeek(week);
	}

	function clearPreview(): void {
		if (current === null) return;
		current = null;
		target?.onPagerPreviewWeek(null);
	}

	return {
		get current() {
			return current;
		},
		attach,
		detach,
		setPreview,
		clearPreview
	};
}

export type CapsulePagerPreview = ReturnType<typeof createCapsulePagerPreview>;
