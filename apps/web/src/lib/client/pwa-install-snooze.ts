export const SNOOZE_KEY = 'chronos:pwa-install-snoozed-until';
export const SNOOZE_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export function parseSnoozedUntil(raw: string | null): number | null {
	if (!raw) return null;
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : null;
}

export function isInstallPromptSnoozed(snoozedUntil: number | null, now = Date.now()): boolean {
	return snoozedUntil !== null && now < snoozedUntil;
}
