package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.PeriodTime
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableViewPrefs
import com.chronos.mobile.core.model.defaultPeriodTimes
import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.TimetableRepository
import com.chronos.mobile.domain.model.TimetableSettingsDraft
import javax.inject.Inject

class SaveTimetableDetailsUseCase @Inject constructor(
    private val repository: TimetableRepository,
    private val academicCalendarService: AcademicCalendarService,
    private val timeProvider: TimeProvider,
) {
    constructor(repository: TimetableRepository) : this(repository, AcademicCalendarService(), com.chronos.mobile.domain.SystemTimeProvider())

    suspend operator fun invoke(timetableId: String, draft: TimetableSettingsDraft) {
        val timetable = repository.getTimetable(timetableId) ?: return
        val safeStartWeek = draft.academicConfig.startWeek.coerceAtLeast(1)
        val normalizedPeriods = draft.academicConfig.periodTimes
            .sortedBy { it.index }
            .mapIndexed { index, period ->
                PeriodTime(
                    index = index + 1,
                    startTime = period.startTime.trim().ifBlank {
                        defaultPeriodTimes().getOrNull(index)?.startTime ?: "--:--"
                    },
                    endTime = period.endTime.trim().ifBlank {
                        defaultPeriodTimes().getOrNull(index)?.endTime ?: "--:--"
                    },
                )
            }
            .ifEmpty { defaultPeriodTimes() }

        repository.saveTimetable(
            timetable.copy(
                name = draft.name.trim().ifBlank { "未命名课表" },
                updatedAt = timeProvider.currentTimeMillis(),
                academicConfig = AcademicConfig(
                    termStartDate = academicCalendarService
                        .normalizeTermStartDate(draft.academicConfig.termStartDate, timeProvider.today())
                        .toString(),
                    startWeek = safeStartWeek,
                    endWeek = draft.academicConfig.endWeek.coerceAtLeast(safeStartWeek),
                    periodTimes = normalizedPeriods,
                ),
                importMetadata = TimetableImportMetadata(
                    source = draft.importMetadata.source,
                ),
                viewPrefs = TimetableViewPrefs(
                    showSaturday = draft.viewPrefs.showSaturday,
                    showSunday = draft.viewPrefs.showSunday,
                    showNonCurrentWeekCourses = draft.viewPrefs.showNonCurrentWeekCourses,
                ),
            )
        )
    }
}
