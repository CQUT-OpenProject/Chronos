package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.ThemeMode
import com.chronos.mobile.domain.TimetableRepository
import javax.inject.Inject

class SetThemeModeUseCase @Inject constructor(
    private val repository: TimetableRepository,
) {
    suspend operator fun invoke(mode: ThemeMode) {
        repository.setThemeMode(mode)
    }
}
