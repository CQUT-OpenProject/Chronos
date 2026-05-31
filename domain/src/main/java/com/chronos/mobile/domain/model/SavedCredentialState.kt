package com.chronos.mobile.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class SavedCredentialState(
    val account: String? = null,
    val hasSavedCredential: Boolean = false,
    val protectionAvailable: Boolean = false,
)
