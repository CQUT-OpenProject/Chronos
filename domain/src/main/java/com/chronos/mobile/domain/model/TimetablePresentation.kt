package com.chronos.mobile.domain.model

import androidx.compose.runtime.Immutable
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.PeriodTime
import java.time.LocalDate

@Immutable
data class TimetableDayModel(
    val dayOfWeek: Int,
    val date: LocalDate,
    val isToday: Boolean,
)

@Immutable
data class TimetableGridModel(
    val monthLabel: String,
    val visibleDays: List<TimetableDayModel>,
    val periods: List<PeriodTime>,
    val displayedPeriodCount: Int,
)

@Immutable
data class TimetableCourseDisplayModel(
    val course: Course,
    val isInDisplayedWeek: Boolean,
)
