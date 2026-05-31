package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.TimetableRepository
import java.util.UUID
import javax.inject.Inject

class CreateTimetableUseCase @Inject constructor(
    private val repository: TimetableRepository,
    private val academicCalendarService: AcademicCalendarService,
    private val timeProvider: TimeProvider,
) {
    constructor(repository: TimetableRepository) : this(repository, AcademicCalendarService(), com.chronos.mobile.domain.SystemTimeProvider())

    suspend operator fun invoke(name: String) {
        val now = timeProvider.currentTimeMillis()
        val timetable = Timetable(
            id = UUID.randomUUID().toString(),
            name = name.trim().ifBlank { "未命名课表" },
            courses = emptyList(),
            createdAt = now,
            updatedAt = now,
            academicConfig = AcademicConfig(
                termStartDate = academicCalendarService
                    .normalizeTermStartDate("", timeProvider.today())
                    .toString(),
            ),
        )
        repository.saveTimetable(timetable)
        repository.setCurrentTimetableId(timetable.id)
    }
}
