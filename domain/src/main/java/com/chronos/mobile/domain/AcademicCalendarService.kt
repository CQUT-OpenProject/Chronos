package com.chronos.mobile.domain

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.currentWeekMonday
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalAdjusters
import javax.inject.Inject

class AcademicCalendarService @Inject constructor() {
    fun normalizeTermStartDate(raw: String, referenceDate: LocalDate): LocalDate = runCatching {
        LocalDate.parse(raw.trim())
    }.getOrElse {
        currentWeekMonday(referenceDate)
    }.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))

    fun calculateAcademicWeek(today: LocalDate, academicConfig: AcademicConfig?): Int {
        val configured = academicConfig ?: AcademicConfig()
        val termStart = normalizeTermStartDate(configured.termStartDate, today)
        if (today.isBefore(termStart)) {
            return configured.startWeek
        }
        val weeks = ChronoUnit.WEEKS.between(termStart, today).toInt()
        return (configured.startWeek + weeks).coerceIn(configured.startWeek, configured.endWeek)
    }

    fun resolveWeekStart(
        academicConfig: AcademicConfig,
        week: Int,
        referenceDate: LocalDate,
    ): LocalDate {
        val termStart = normalizeTermStartDate(academicConfig.termStartDate, referenceDate)
        return termStart.plusWeeks((week - academicConfig.startWeek).toLong())
    }

    fun resolveCourseDate(
        academicConfig: AcademicConfig,
        week: Int,
        dayOfWeek: Int,
        referenceDate: LocalDate,
    ): LocalDate = resolveWeekStart(academicConfig, week, referenceDate)
        .plusDays((dayOfWeek - 1).toLong())
}
