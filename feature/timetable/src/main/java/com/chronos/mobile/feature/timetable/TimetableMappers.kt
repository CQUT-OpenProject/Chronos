package com.chronos.mobile.feature.timetable

import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.model.AcademicConfigDraft
import com.chronos.mobile.domain.model.CourseDraft
import com.chronos.mobile.domain.model.PeriodTimeDraft
import com.chronos.mobile.domain.model.TimetableImportMetadataDraft
import com.chronos.mobile.domain.model.TimetableSettingsDraft
import com.chronos.mobile.domain.model.TimetableViewPrefsDraft
import java.time.LocalDate

private val academicCalendarService = AcademicCalendarService()

internal fun com.chronos.mobile.core.model.Course.toDraft(): CourseDraft =
    CourseDraft(
        id = id,
        name = name,
        teacher = teacher,
        location = location,
        dayOfWeek = dayOfWeek,
        startPeriod = startPeriod,
        endPeriod = endPeriod,
        color = color,
        textColor = textColor,
        weeks = weeks,
        remark = remark,
    )

internal fun Timetable.toSettingsDraft(): TimetableSettingsDraft =
    TimetableSettingsDraft(
        name = name,
        academicConfig = AcademicConfigDraft(
            termStartDate = academicCalendarService
                .normalizeTermStartDate(academicConfig.termStartDate, LocalDate.now())
                .toString(),
            startWeek = academicConfig.startWeek,
            endWeek = academicConfig.endWeek,
            periodTimes = academicConfig.periodTimes.map {
                PeriodTimeDraft(
                    index = it.index,
                    startTime = it.startTime,
                    endTime = it.endTime,
                )
            },
        ),
        importMetadata = TimetableImportMetadataDraft(
            source = importMetadata.source,
        ),
        viewPrefs = TimetableViewPrefsDraft(
            showSaturday = viewPrefs.showSaturday,
            showSunday = viewPrefs.showSunday,
            showNonCurrentWeekCourses = viewPrefs.showNonCurrentWeekCourses,
        ),
    )

internal fun List<PeriodTimeDraft>.replaceAt(index: Int, item: PeriodTimeDraft): List<PeriodTimeDraft> =
    mapIndexed { currentIndex, currentItem ->
        if (currentIndex == index) item else currentItem
    }

internal fun List<PeriodTimeDraft>.removeAt(index: Int): List<PeriodTimeDraft> =
    filterIndexed { currentIndex, _ -> currentIndex != index }

internal fun List<PeriodTimeDraft>.reindexPeriodTimes(): List<PeriodTimeDraft> =
    mapIndexed { index, state -> state.copy(index = index + 1) }
