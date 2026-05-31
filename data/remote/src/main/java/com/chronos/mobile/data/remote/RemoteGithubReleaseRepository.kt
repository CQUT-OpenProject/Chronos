package com.chronos.mobile.data.remote

import android.util.Log
import com.chronos.mobile.domain.GithubReleaseRepository
import com.chronos.mobile.domain.model.GithubRelease
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.asSuccess
import com.chronos.mobile.domain.result.toAppError
import java.io.IOException
import javax.inject.Inject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request

class RemoteGithubReleaseRepository @Inject constructor(
    private val baseClient: OkHttpClient,
) : GithubReleaseRepository {
    private companion object {
        const val TAG = "GithubRelease"
        const val RESPONSE_PREVIEW_LENGTH = 240
    }

    private val json = Json {
        ignoreUnknownKeys = true
    }

    override suspend fun fetchReleaseByTag(
        owner: String,
        repo: String,
        tag: String,
    ): AppResult<GithubRelease> {
        val requestUrl = "https://api.github.com/repos/$owner/$repo/releases/tags/$tag"
        val request = Request.Builder()
            .url(requestUrl)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "Chronos-Android-App")
            .build()

        logDebug("Fetching release from $requestUrl")
        return withContext(Dispatchers.IO) {
            try {
                val payload = baseClient.newCall(request).execute().use { response ->
                    val body = response.body.string()
                    if (!response.isSuccessful) {
                        val errorMessage = parseErrorMessage(body)
                            ?: "GitHub release 请求失败：HTTP ${response.code}"
                        logError(
                            "GitHub release request failed: code=${response.code}, message=${response.message}, body=${body.preview()}",
                        )
                        return@withContext AppError.Network(errorMessage).asFailure()
                    }
                    logDebug("GitHub release request succeeded: code=${response.code}, body=${body.preview()}")
                    body
                }
                parseRelease(payload)
            } catch (throwable: Throwable) {
                logError("GitHub release request threw ${throwable::class.java.simpleName}", throwable)
                throwable.toGithubAppError().asFailure()
            }
        }
    }

    private fun parseRelease(raw: String): AppResult<GithubRelease> = runCatching {
        val element = json.parseToJsonElement(raw) as? JsonObject
            ?: throw IllegalStateException("Unexpected release payload")
        val message = element.stringValue("message")
        if (!message.isNullOrBlank()) {
            throw IOException(message)
        }
        GithubRelease(
            tagName = element.stringValue("tag_name").orEmpty(),
            name = element.stringValue("name").orEmpty(),
            publishedAt = element.stringValue("published_at").orEmpty(),
            body = element.stringValue("body").orEmpty(),
            htmlUrl = element.stringValue("html_url").orEmpty(),
        )
    }.fold(
        onSuccess = { it.asSuccess() },
        onFailure = { throwable ->
            when (throwable) {
                is IOException -> AppError.Network(throwable.message ?: "无法获取 GitHub Release 信息，请稍后重试").asFailure()
                else -> AppError.DataFormat("GitHub release 数据格式错误").asFailure()
            }
        },
    )

    private fun JsonObject.stringValue(key: String): String? =
        this[key]?.jsonPrimitive?.contentOrNull

    private fun parseErrorMessage(raw: String): String? = runCatching {
        val element = json.parseToJsonElement(raw)
        (element as? JsonObject)?.stringValue("message")
    }.getOrNull()

    private fun String.preview(): String =
        replace('\n', ' ').take(RESPONSE_PREVIEW_LENGTH)

    private fun logDebug(message: String) {
        runCatching { Log.d(TAG, message) }
    }

    private fun logError(message: String, throwable: Throwable? = null) {
        runCatching {
            if (throwable == null) {
                Log.e(TAG, message)
            } else {
                Log.e(TAG, message, throwable)
            }
        }
    }

    private fun Throwable.toGithubAppError(): AppError {
        val mapped = toAppError()
        return if (mapped is AppError.Unknown) {
            AppError.Network("无法获取 GitHub Release 信息，请检查网络后重试")
        } else {
            mapped
        }
    }
}
