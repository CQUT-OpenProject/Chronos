/** Marker for plugin-bundle UI that must mount with its own Svelte runtime. */
export const CHRONOS_MOUNTABLE = Symbol.for('chronos.mountable');

export type ChronosMountHandle = { unmount?(): void } | (() => void);

export interface ChronosMountable<Props extends Record<string, unknown> = Record<string, unknown>> {
	readonly [CHRONOS_MOUNTABLE]: true;
	mount(target: HTMLElement, props: Props): ChronosMountHandle;
}

export function isChronosMountable(value: unknown): value is ChronosMountable {
	if (typeof value !== 'object' || value === null) return false;
	const record = value as Record<symbol, unknown>;
	return (
		record[CHRONOS_MOUNTABLE] === true && typeof (value as ChronosMountable).mount === 'function'
	);
}
