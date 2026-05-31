package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableImportSource
import com.chronos.mobile.domain.RemoteTimetableSource
import com.chronos.mobile.domain.TimetableShareCodec
import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.flatMap
import com.chronos.mobile.domain.result.map
import javax.inject.Inject

class PreviewOnlineTimetableUseCase @Inject constructor(
    private val remoteTimetableSource: RemoteTimetableSource,
    private val timetableShareCodec: TimetableShareCodec,
) {
    suspend operator fun invoke(authSnapshot: AuthSnapshot): AppResult<Timetable> =
        remoteTimetableSource.fetchSchedule(authSnapshot)
            .flatMap(timetableShareCodec::toTimetable)
            .map { timetable ->
                timetable.copy(importMetadata = TimetableImportMetadata(source = TimetableImportSource.ONLINE_EDU))
            }
}
