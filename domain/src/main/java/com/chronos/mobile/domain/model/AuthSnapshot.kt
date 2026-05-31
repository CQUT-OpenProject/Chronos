package com.chronos.mobile.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class AuthSnapshot(
    val account: String,
    val password: String,
)
