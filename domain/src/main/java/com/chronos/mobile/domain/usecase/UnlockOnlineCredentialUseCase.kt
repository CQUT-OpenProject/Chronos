package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.SecureCredentialStore
import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.result.AppResult
import javax.crypto.Cipher
import javax.inject.Inject

class UnlockOnlineCredentialUseCase @Inject constructor(
    private val secureCredentialStore: SecureCredentialStore,
) {
    suspend operator fun invoke(cipher: Cipher): AppResult<AuthSnapshot> = secureCredentialStore.unlock(cipher)
}
