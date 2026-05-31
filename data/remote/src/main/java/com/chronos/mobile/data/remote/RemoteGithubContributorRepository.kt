package com.chronos.mobile.data.remote

import android.util.Log
import com.chronos.mobile.domain.GithubContributorRepository
import com.chronos.mobile.domain.model.GithubContributor
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.asSuccess
import com.chronos.mobile.domain.result.toAppError
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import javax.inject.Inject

class RemoteGithubContributorRepository @Inject constructor(
    private val baseClient: OkHttpClient,
) : GithubContributorRepository {
    private companion object {
        const val TAG = "GithubContributors"
        const val RESPONSE_PREVIEW_LENGTH = 240
    }

    private val json = Json {
        ignoreUnknownKeys = true
    }

    override suspend fun fetchContributors(
        owner: String,
        repo: String,
        limit: Int,
    ): AppResult<List<GithubContributor>> {
        val normalizedLimit = limit.coerceAtLeast(1)
        val requestUrl = "https://api.github.com/repos/$owner/$repo/contributors?per_page=$normalizedLimit"
        val request = Request.Builder()
            .url(requestUrl)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .header("User-Agent", "Chronos-Android-App")
            .build()

        logDebug("Fetching contributors from $requestUrl")
        return withContext(Dispatchers.IO) {
            try {
                val payload = baseClient.newCall(request).execute().use { response ->
                    val body = response.body.string()
                    if (!response.isSuccessful) {
                        val errorMessage = parseErrorMessage(body)
                            ?: "GitHub contributors 请求失败：HTTP ${response.code}"
                        logError(
                            "GitHub contributors request failed: code=${response.code}, message=${response.message}, body=${body.preview()}",
                        )
                        return@withContext AppError.Network(errorMessage).asFailure()
                    }
                    logDebug(
                        "GitHub contributors request succeeded: code=${response.code}, body=${body.preview()}",
                    )
                    body
                }
                parseContributors(payload)
            } catch (throwable: Throwable) {
                logError("GitHub contributors request threw ${throwable::class.java.simpleName}", throwable)
                throwable.toGithubAppError().asFailure()
            }
        }
    }

    private fun parseContributors(raw: String): AppResult<List<GithubContributor>> = runCatching {
        when (val element = json.parseToJsonElement(raw)) {
            is JsonArray -> element
            is JsonObject -> {
                val message = element.stringValue("message")
                throw IOException(message ?: "GitHub contributors 接口返回异常")
            }
            else -> error("Unexpected contributors payload")
        }
    }.fold(
        onSuccess = { array ->
        array.mapNotNull { element ->
            val jsonObject = element as? JsonObject ?: return@mapNotNull null
            val login = jsonObject.stringValue("login") ?: return@mapNotNull null
            val avatarUrl = jsonObject.stringValue("avatar_url") ?: return@mapNotNull null
            val profileUrl = jsonObject.stringValue("html_url") ?: return@mapNotNull null
            GithubContributor(
                login = login,
                avatarUrl = avatarUrl,
                profileUrl = profileUrl,
                contributions = jsonObject.intValue("contributions") ?: 0,
                type = jsonObject.stringValue("type").orEmpty(),
            )
            }.asSuccess()
        },
        onFailure = { throwable ->
            when (throwable) {
                is IOException -> AppError.Network(throwable.message ?: "无法获取 GitHub 贡献者信息，请稍后重试").asFailure()
                else -> AppError.DataFormat("GitHub contributors 数据格式错误").asFailure()
            }
        },
    )

    private fun JsonObject.stringValue(key: String): String? =
        this[key]?.jsonPrimitive?.contentOrNull

    private fun JsonObject.intValue(key: String): Int? =
        this[key]?.jsonPrimitive?.intOrNull

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
            AppError.Network("无法获取 GitHub 贡献者信息，请检查网络后重试")
        } else {
            mapped
        }
    }
}
