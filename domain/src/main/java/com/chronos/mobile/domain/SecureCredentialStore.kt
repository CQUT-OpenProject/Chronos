package com.chronos.mobile.domain

import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.model.SavedCredentialState
import com.chronos.mobile.domain.result.AppResult
import javax.crypto.Cipher
import kotlinx.coroutines.flow.Flow

interface SecureCredentialStore {
    val savedCredentialState: Flow<SavedCredentialState>

    fun isReusableCredentialProtectionAvailable(): Boolean

    fun createSaveCipher(): AppResult<Cipher>

    suspend fun saveCredential(
        account: String,
        password: String,
        cipher: Cipher,
    ): AppResult<Unit>

    suspend fun createUnlockCipher(): AppResult<Cipher>

    suspend fun unlock(cipher: Cipher): AppResult<AuthSnapshot>

    suspend fun clearCredential()
}
