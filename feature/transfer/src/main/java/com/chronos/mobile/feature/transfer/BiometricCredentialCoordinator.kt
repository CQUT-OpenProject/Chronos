package com.chronos.mobile.feature.transfer

import android.content.Context
import android.content.ContextWrapper
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.asSuccess
import javax.crypto.Cipher
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class BiometricCredentialCoordinator(
    private val activity: FragmentActivity?,
) {
    suspend fun authenticate(
        title: String,
        cipher: Cipher,
    ): AppResult<Cipher> {
        val hostActivity = activity ?: return AppError.Security("无法启动生物识别验证").asFailure()
        val authenticatedCipher = suspendCancellableCoroutine { continuation ->
            val prompt = BiometricPrompt(
                hostActivity,
                ContextCompat.getMainExecutor(hostActivity),
                object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        continuation.resume(result.cryptoObject?.cipher)
                    }

                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        if (continuation.isActive) {
                            continuation.resume(null)
                        }
                    }
                },
            )
            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle(title)
                .setAllowedAuthenticators(BIOMETRIC_STRONG or DEVICE_CREDENTIAL)
                .build()
            prompt.authenticate(promptInfo, BiometricPrompt.CryptoObject(cipher))
        }
        return authenticatedCipher?.asSuccess()
            ?: AppError.Security("已取消设备验证").asFailure()
    }

    companion object {
        fun from(context: Context): BiometricCredentialCoordinator =
            BiometricCredentialCoordinator(context.findFragmentActivity())
    }
}

private fun Context.findFragmentActivity(): FragmentActivity? = when (this) {
    is FragmentActivity -> this
    is ContextWrapper -> baseContext.findFragmentActivity()
    else -> null
}
