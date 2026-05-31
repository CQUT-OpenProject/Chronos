package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.SecureCredentialStore
import com.chronos.mobile.domain.model.SavedCredentialState
import javax.inject.Inject
import kotlinx.coroutines.flow.Flow

class ObserveSavedCredentialStateUseCase @Inject constructor(
    private val secureCredentialStore: SecureCredentialStore,
) {
    operator fun invoke(): Flow<SavedCredentialState> = secureCredentialStore.savedCredentialState
}
