package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.domain.AcademicCalendarService
import java.time.LocalDate
import javax.inject.Inject

class CalculateAcademicWeekUseCase @Inject constructor(
    private val academicCalendarService: AcademicCalendarService,
) {
    constructor() : this(AcademicCalendarService())

    operator fun invoke(today: LocalDate, academicConfig: AcademicConfig?): Int =
        academicCalendarService.calculateAcademicWeek(today, academicConfig)
}
