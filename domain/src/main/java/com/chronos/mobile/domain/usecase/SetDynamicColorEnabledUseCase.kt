package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.TimetableRepository
import javax.inject.Inject

class SetDynamicColorEnabledUseCase @Inject constructor(
    private val repository: TimetableRepository,
) {
    suspend operator fun invoke(enabled: Boolean) {
        repository.setUseDynamicColor(enabled)
    }
}
