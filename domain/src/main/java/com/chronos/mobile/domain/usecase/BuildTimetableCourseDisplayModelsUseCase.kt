package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.model.TimetableCourseDisplayModel
import java.time.LocalDate
import javax.inject.Inject

class BuildTimetableCourseDisplayModelsUseCase @Inject constructor(
    private val academicCalendarService: AcademicCalendarService,
) {
    constructor() : this(AcademicCalendarService())

    operator fun invoke(
        timetable: Timetable,
        visibleDayOfWeeks: Set<Int>,
        displayedWeek: Int,
        today: LocalDate,
    ): List<TimetableCourseDisplayModel> {
        val visibleCourses = timetable.courses.withIndex().filter { (_, course) ->
            course.dayOfWeek in visibleDayOfWeeks
        }
        val currentEntries = visibleCourses
            .filter { (_, course) -> course.weeks.isEmpty() || displayedWeek in course.weeks }
            .map { (_, course) ->
                TimetableCourseDisplayModel(
                    course = course.copy(weeks = course.weeks.toList()),
                    isInDisplayedWeek = true,
                )
            }
        if (!timetable.viewPrefs.showNonCurrentWeekCourses) {
            return currentEntries
        }

        val occupiedSlots = currentEntries.mapTo(mutableSetOf()) { it.course.slotKey() }
        val futureCandidatesBySlot = linkedMapOf<CourseSlotKey, FutureCourseCandidate>()
        visibleCourses.forEach { (originalIndex, course) ->
            if (course.weeks.isEmpty() || displayedWeek in course.weeks) return@forEach
            val nextWeek = course.weeks.filter { it >= displayedWeek }.minOrNull() ?: return@forEach
            val slotKey = course.slotKey()
            if (slotKey in occupiedSlots) return@forEach
            val candidate = FutureCourseCandidate(
                course = course,
                nextOccurrenceDate = academicCalendarService.resolveCourseDate(
                    academicConfig = timetable.academicConfig,
                    week = nextWeek,
                    dayOfWeek = course.dayOfWeek,
                    referenceDate = today,
                ),
                originalIndex = originalIndex,
            )
            val current = futureCandidatesBySlot[slotKey]
            if (current == null || candidate.isBetterFutureCandidateThan(current)) {
                futureCandidatesBySlot[slotKey] = candidate
            }
        }

        val futureEntries = futureCandidatesBySlot.values
            .sortedWith(compareBy<FutureCourseCandidate> { it.originalIndex }.thenBy { it.nextOccurrenceDate })
            .map { candidate ->
                TimetableCourseDisplayModel(
                    course = candidate.course.copy(weeks = candidate.course.weeks.toList()),
                    isInDisplayedWeek = false,
                )
            }
        return currentEntries + futureEntries
    }
}

private data class CourseSlotKey(
    val dayOfWeek: Int,
    val startPeriod: Int,
    val endPeriod: Int,
)

private data class FutureCourseCandidate(
    val course: Course,
    val nextOccurrenceDate: LocalDate,
    val originalIndex: Int,
)

private fun Course.slotKey(): CourseSlotKey = CourseSlotKey(
    dayOfWeek = dayOfWeek,
    startPeriod = startPeriod,
    endPeriod = endPeriod,
)

private fun FutureCourseCandidate.isBetterFutureCandidateThan(other: FutureCourseCandidate): Boolean =
    compareValuesBy(this, other, FutureCourseCandidate::nextOccurrenceDate, FutureCourseCandidate::originalIndex) < 0
