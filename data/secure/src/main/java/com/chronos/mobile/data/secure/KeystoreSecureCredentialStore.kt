package com.chronos.mobile.data.secure

import android.content.Context
import android.os.Build
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.biometric.BiometricManager
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import com.chronos.mobile.domain.SecureCredentialStore
import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.model.SavedCredentialState
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.appResultOf
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.asSuccess
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import java.security.GeneralSecurityException
import java.security.InvalidKeyException
import java.security.KeyStore
import java.util.Base64
import javax.crypto.AEADBadTagException
import javax.crypto.BadPaddingException
import javax.crypto.Cipher
import javax.crypto.IllegalBlockSizeException
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

@Singleton
class KeystoreSecureCredentialStore @Inject constructor(
    @param:ApplicationContext private val context: Context,
) : SecureCredentialStore {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val dataStore = PreferenceDataStoreFactory.create(
        scope = scope,
        produceFile = { File(context.noBackupFilesDir, CREDENTIAL_FILE_NAME) },
    )

    init {
        scope.launch {
            sanitizeCredentialIfInvalidAtStartup()
        }
    }

    override val savedCredentialState: Flow<SavedCredentialState> = dataStore.data
        .catch { emit(emptyPreferences()) }
        .map { preferences ->
            val account = preferences[ACCOUNT_KEY]
            SavedCredentialState(
                account = account,
                hasSavedCredential = !account.isNullOrBlank() && hasCompleteCredential(preferences),
                protectionAvailable = isReusableCredentialProtectionAvailable(),
            )
        }

    override fun isReusableCredentialProtectionAvailable(): Boolean {
        val biometricManager = BiometricManager.from(context)
        return biometricManager.canAuthenticate(ALLOWED_AUTHENTICATORS) == BiometricManager.BIOMETRIC_SUCCESS
    }

    override fun createSaveCipher(): AppResult<Cipher> = appResultOf(
        errorMapper = { AppError.Security("当前设备不支持保存帐号密码") },
    ) {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateSecretKey())
        cipher
    }

    override suspend fun saveCredential(
        account: String,
        password: String,
        cipher: Cipher,
    ): AppResult<Unit> = appResultOf(
        errorMapper = { AppError.Security("保存在线凭据失败") },
    ) {
        val encryptedBytes = cipher.doFinal(password.toByteArray(Charsets.UTF_8))
        dataStore.edit { preferences ->
            preferences[ACCOUNT_KEY] = account.trim()
            preferences[CIPHERTEXT_KEY] = Base64.getEncoder().encodeToString(encryptedBytes)
            preferences[IV_KEY] = Base64.getEncoder().encodeToString(cipher.iv)
        }
    }

    override suspend fun createUnlockCipher(): AppResult<Cipher> {
        val preferences = dataStoreDataSnapshot()
        if (!hasCompleteCredential(preferences)) {
            return AppError.Security("当前没有可用的已保存凭据").asFailure()
        }
        return try {
            createUnlockCipher(preferences).asSuccess()
        } catch (throwable: Throwable) {
            if (throwable.isCredentialIrrecoverable()) {
                clearCredentialQuietly()
                AppError.Security(CREDENTIAL_INVALIDATED_MESSAGE).asFailure()
            } else {
                AppError.Security("当前没有可用的已保存凭据").asFailure()
            }
        }
    }

    override suspend fun unlock(cipher: Cipher): AppResult<AuthSnapshot> {
        val preferences = dataStoreDataSnapshot()
        val account = preferences[ACCOUNT_KEY]?.trim().orEmpty()
        val ciphertext = preferences[CIPHERTEXT_KEY].orEmpty()
        if (account.isEmpty() || ciphertext.isBlank()) {
            return AppError.NotFound("未找到已保存的在线凭据").asFailure()
        }
        return try {
            val password = cipher.doFinal(Base64.getDecoder().decode(ciphertext)).toString(Charsets.UTF_8)
            AuthSnapshot(account = account, password = password).asSuccess()
        } catch (throwable: Throwable) {
            if (throwable.isCredentialIrrecoverable()) {
                clearCredentialQuietly()
                AppError.Security(CREDENTIAL_INVALIDATED_MESSAGE).asFailure()
            } else {
                AppError.Security("读取已保存凭据失败").asFailure()
            }
        }
    }

    override suspend fun clearCredential() {
        dataStore.edit { preferences ->
            preferences.remove(ACCOUNT_KEY)
            preferences.remove(CIPHERTEXT_KEY)
            preferences.remove(IV_KEY)
        }
    }

    private fun getOrCreateSecretKey(): SecretKey {
        val existing = keyStore.getKey(KEY_ALIAS, null) as? SecretKey
        if (existing != null) return existing
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
        val builder = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(true)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            builder.setUserAuthenticationParameters(
                0,
                KeyProperties.AUTH_BIOMETRIC_STRONG or KeyProperties.AUTH_DEVICE_CREDENTIAL,
            )
        } else {
            @Suppress("DEPRECATION")
            builder.setUserAuthenticationValidityDurationSeconds(-1)
        }
        generator.init(builder.build())
        return generator.generateKey()
    }

    private suspend fun dataStoreDataSnapshot() =
        dataStore.data.catch { emit(emptyPreferences()) }.first()

    private suspend fun sanitizeCredentialIfInvalidAtStartup() {
        val preferences = dataStoreDataSnapshot()
        if (!hasCompleteCredential(preferences)) return
        runCatching {
            createUnlockCipher(preferences)
        }.exceptionOrNull()
            ?.takeIf { it.isCredentialIrrecoverable() }
            ?.let { clearCredentialQuietly() }
    }

    private suspend fun createUnlockCipher(preferences: Preferences): Cipher {
        val key = getExistingSecretKey() ?: throw KeyPermanentlyInvalidatedException()
        val ivString = preferences[IV_KEY]
            ?: throw IllegalStateException("未找到已保存的在线凭据")
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(
            Cipher.DECRYPT_MODE,
            key,
            GCMParameterSpec(GCM_TAG_LENGTH_BITS, Base64.getDecoder().decode(ivString)),
        )
        return cipher
    }

    private fun getExistingSecretKey(): SecretKey? =
        keyStore.getKey(KEY_ALIAS, null) as? SecretKey

    private suspend fun clearCredentialQuietly() {
        runCatching { clearCredential() }
    }

    private fun hasCompleteCredential(preferences: Preferences): Boolean {
        val hasCiphertext = !preferences[CIPHERTEXT_KEY].isNullOrBlank()
        val hasIv = !preferences[IV_KEY].isNullOrBlank()
        return hasCiphertext && hasIv
    }

    private fun Throwable.isCredentialIrrecoverable(): Boolean = when (this) {
        is KeyPermanentlyInvalidatedException,
        is InvalidKeyException,
        is AEADBadTagException,
        is BadPaddingException,
        is IllegalBlockSizeException,
        is IllegalArgumentException,
        -> true
        is GeneralSecurityException -> true
        else -> false
    }

    private val keyStore: KeyStore by lazy {
        KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
    }

    private companion object {
        const val CREDENTIAL_FILE_NAME = "online_credentials.preferences_pb"
        const val KEY_ALIAS = "chronos.online.credentials"
        const val ANDROID_KEYSTORE = "AndroidKeyStore"
        const val TRANSFORMATION = "AES/GCM/NoPadding"
        const val GCM_TAG_LENGTH_BITS = 128
        const val CREDENTIAL_INVALIDATED_MESSAGE = "已保存凭据已失效，请重新录入账号和密码"
        const val ALLOWED_AUTHENTICATORS =
            BiometricManager.Authenticators.BIOMETRIC_STRONG or
                BiometricManager.Authenticators.DEVICE_CREDENTIAL

        val ACCOUNT_KEY = stringPreferencesKey("saved_account")
        val CIPHERTEXT_KEY = stringPreferencesKey("saved_ciphertext")
        val IV_KEY = stringPreferencesKey("saved_iv")
    }
}
