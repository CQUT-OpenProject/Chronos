package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.SecureCredentialStore
import com.chronos.mobile.domain.result.AppResult
import javax.crypto.Cipher
import javax.inject.Inject

class PrepareCredentialSaveUseCase @Inject constructor(
    private val secureCredentialStore: SecureCredentialStore,
) {
    operator fun invoke(): AppResult<Cipher> = secureCredentialStore.createSaveCipher()
}
