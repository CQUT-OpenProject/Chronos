import { PREVIEW_RATE_LIMIT_MAX, PREVIEW_RATE_LIMIT_WINDOW_MS } from './config';

interface RateLimitBucket {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

function pruneExpiredBuckets(now: number): void {
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) {
			buckets.delete(key);
		}
	}
}

export function checkPreviewRateLimit(
	ip: string,
	now = Date.now()
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
	pruneExpiredBuckets(now);

	const bucket = buckets.get(ip);
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(ip, { count: 1, resetAt: now + PREVIEW_RATE_LIMIT_WINDOW_MS });
		return { allowed: true };
	}

	if (bucket.count >= PREVIEW_RATE_LIMIT_MAX) {
		return {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
		};
	}

	bucket.count += 1;
	return { allowed: true };
}

/** Visible for tests only. */
export function resetPreviewRateLimitForTests(): void {
	buckets.clear();
}
