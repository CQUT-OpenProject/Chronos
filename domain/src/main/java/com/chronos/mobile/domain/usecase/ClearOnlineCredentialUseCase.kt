package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.SecureCredentialStore
import javax.inject.Inject

class ClearOnlineCredentialUseCase @Inject constructor(
    private val secureCredentialStore: SecureCredentialStore,
) {
    suspend operator fun invoke() {
        secureCredentialStore.clearCredential()
    }
}
