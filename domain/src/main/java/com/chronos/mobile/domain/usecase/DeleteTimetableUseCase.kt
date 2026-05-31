package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.TimetableRepository
import javax.inject.Inject

class DeleteTimetableUseCase @Inject constructor(
    private val repository: TimetableRepository,
) {
    suspend operator fun invoke(id: String) {
        repository.deleteTimetable(id)
        val nextTimetableId = repository.getAppStateSnapshot().timetables.firstOrNull()?.id
        repository.setCurrentTimetableId(nextTimetableId)
    }
}
