package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.TimetableRepository
import javax.inject.Inject

class SwitchTimetableUseCase @Inject constructor(
    private val repository: TimetableRepository,
) {
    suspend operator fun invoke(id: String) {
        repository.setCurrentTimetableId(id)
    }
}
