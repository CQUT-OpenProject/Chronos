package com.chronos.mobile.domain

import com.chronos.mobile.core.model.OnlineSchedulePayload
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.result.AppResult

interface TimetableShareCodec {
    fun decode(json: String): AppResult<OnlineSchedulePayload>
    fun encode(timetable: Timetable): AppResult<String>
    fun toTimetable(payload: OnlineSchedulePayload): AppResult<Timetable>
}
