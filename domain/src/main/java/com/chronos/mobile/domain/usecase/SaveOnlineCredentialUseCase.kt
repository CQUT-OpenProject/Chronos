package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.SecureCredentialStore
import com.chronos.mobile.domain.result.AppResult
import javax.crypto.Cipher
import javax.inject.Inject

class SaveOnlineCredentialUseCase @Inject constructor(
    private val secureCredentialStore: SecureCredentialStore,
) {
    suspend operator fun invoke(
        account: String,
        password: String,
        cipher: Cipher,
    ): AppResult<Unit> = secureCredentialStore.saveCredential(account = account, password = password, cipher = cipher)
}
