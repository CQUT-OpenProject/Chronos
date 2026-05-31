package com.chronos.mobile.domain.result

sealed interface AppError {
    val message: String

    data class Validation(
        override val message: String,
    ) : AppError

    data class Auth(
        override val message: String,
    ) : AppError

    data class Network(
        override val message: String,
    ) : AppError

    data class DataFormat(
        override val message: String,
    ) : AppError

    data class Security(
        override val message: String,
    ) : AppError

    data class NotFound(
        override val message: String,
    ) : AppError

    data class Unknown(
        override val message: String,
        val cause: Throwable? = null,
    ) : AppError
}
