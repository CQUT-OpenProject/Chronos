import { PLUGIN_RATE_LIMIT_MAX, PLUGIN_RATE_LIMIT_WINDOW_MS } from './config';

interface RateLimitBucket {
	count: number;
	resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

function bucketKey(pluginId: string, ip: string): string {
	return `${pluginId}:${ip}`;
}

function pruneExpiredBuckets(now: number): void {
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) {
			buckets.delete(key);
		}
	}
}

export function checkPluginRateLimit(
	pluginId: string,
	ip: string,
	now = Date.now()
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
	pruneExpiredBuckets(now);

	const key = bucketKey(pluginId, ip);
	const bucket = buckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + PLUGIN_RATE_LIMIT_WINDOW_MS });
		return { allowed: true };
	}

	if (bucket.count >= PLUGIN_RATE_LIMIT_MAX) {
		return {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
		};
	}

	bucket.count += 1;
	return { allowed: true };
}

/** Visible for tests only. */
export function resetPluginRateLimitForTests(): void {
	buckets.clear();
}
