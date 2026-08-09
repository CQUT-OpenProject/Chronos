import type { OnlineScheduleFetchResult } from '$lib/models/online-schedule';
import type { AuthSnapshot } from '$lib/models/auth';
import type { AppResult } from '../result/app-result';

export interface RemoteTimetableSource {
	fetchSchedule(
		authSnapshot: AuthSnapshot,
		weekNum?: string | null,
		yearTerm?: string | null
	): Promise<AppResult<OnlineScheduleFetchResult>>;
}
