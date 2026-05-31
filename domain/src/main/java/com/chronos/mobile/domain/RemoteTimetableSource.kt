package com.chronos.mobile.domain

import com.chronos.mobile.core.model.OnlineSchedulePayload
import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.result.AppResult

interface RemoteTimetableSource {
    suspend fun fetchSchedule(
        authSnapshot: AuthSnapshot,
        weekNum: String? = null,
        yearTerm: String? = null,
    ): AppResult<OnlineSchedulePayload>
}
