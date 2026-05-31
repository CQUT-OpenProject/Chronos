package com.chronos.mobile.domain.result

import java.io.IOException
import java.io.InterruptedIOException
import java.net.UnknownHostException
import kotlinx.serialization.SerializationException

inline fun <T> appResultOf(
    errorMapper: (Throwable) -> AppError = Throwable::toAppError,
    block: () -> T,
): AppResult<T> = try {
    AppResult.Success(block())
} catch (throwable: Throwable) {
    AppResult.Failure(errorMapper(throwable))
}

fun Throwable.toAppError(): AppError {
    if (this is AppException) return error
    if (this is IllegalArgumentException) return AppError.Validation(message ?: "输入内容无效")
    if (this is IllegalStateException) return AppError.Unknown(message ?: "当前操作无法完成", this)
    if (this is SerializationException) return AppError.DataFormat(message ?: "数据格式错误")
    if (this is UnknownHostException) return AppError.Network("无法连接教务系统，请检查网络或 DNS 设置")
    if (this is InterruptedIOException) return AppError.Network("连接教务系统超时，请稍后重试")
    if (this is IOException) return AppError.Network(message ?: "网络请求失败")
    return AppError.Unknown(message ?: "发生未知错误", this)
}

class AppException(
    val error: AppError,
) : RuntimeException(error.message)
