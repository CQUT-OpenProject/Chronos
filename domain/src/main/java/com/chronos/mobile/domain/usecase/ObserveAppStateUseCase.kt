package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.AppState
import com.chronos.mobile.domain.TimetableRepository
import javax.inject.Inject
import kotlinx.coroutines.flow.Flow

class ObserveAppStateUseCase @Inject constructor(
    private val repository: TimetableRepository,
) {
    operator fun invoke(): Flow<AppState> = repository.appState
}
