package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.SecureCredentialStore
import com.chronos.mobile.domain.result.AppResult
import javax.crypto.Cipher
import javax.inject.Inject

class PrepareCredentialUnlockUseCase @Inject constructor(
    private val secureCredentialStore: SecureCredentialStore,
) {
    suspend operator fun invoke(): AppResult<Cipher> = secureCredentialStore.createUnlockCipher()
}
