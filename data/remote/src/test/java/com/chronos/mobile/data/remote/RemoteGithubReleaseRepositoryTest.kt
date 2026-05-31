package com.chronos.mobile.data.remote

import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import java.net.UnknownHostException
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class RemoteGithubReleaseRepositoryTest {
    @Test
    fun `fetchReleaseByTag parses release object`() = runBlocking {
        val repository = createRepository(
            responseCode = 200,
            responseBody = """
                {
                  "tag_name": "v1.0.0",
                  "name": "Chronos 1.0.0",
                  "published_at": "2026-03-21T00:00:00Z",
                  "body": "Release notes",
                  "html_url": "https://github.com/UE-DND/Chronos/releases/tag/v1.0.0"
                }
            """.trimIndent(),
        )

        val result = repository.fetchReleaseByTag(
            owner = "UE-DND",
            repo = "Chronos",
            tag = "v1.0.0",
        )

        assertTrue(result is AppResult.Success)
        val release = (result as AppResult.Success).value
        assertEquals("v1.0.0", release.tagName)
        assertEquals("Chronos 1.0.0", release.name)
        assertEquals("Release notes", release.body)
    }

    @Test
    fun `fetchReleaseByTag maps github message object to network error`() = runBlocking {
        val repository = createRepository(
            responseCode = 404,
            responseBody = """
                {
                  "message": "Not Found"
                }
            """.trimIndent(),
        )

        val result = repository.fetchReleaseByTag(
            owner = "UE-DND",
            repo = "Chronos",
            tag = "v1.0.0",
        )

        assertTrue(result is AppResult.Failure)
        val error = (result as AppResult.Failure).error
        assertTrue(error is AppError.Network)
        assertEquals("Not Found", error.message)
    }

    @Test
    fun `fetchReleaseByTag returns data format failure when payload is invalid`() = runBlocking {
        val repository = createRepository(
            responseCode = 200,
            responseBody = "{ invalid json",
        )

        val result = repository.fetchReleaseByTag(
            owner = "UE-DND",
            repo = "Chronos",
            tag = "v1.0.0",
        )

        assertTrue(result is AppResult.Failure)
        assertTrue((result as AppResult.Failure).error is AppError.DataFormat)
    }

    @Test
    fun `fetchReleaseByTag maps network exception to network error`() = runBlocking {
        val client = OkHttpClient.Builder()
            .addInterceptor { throw UnknownHostException("unreachable") }
            .build()
        val repository = RemoteGithubReleaseRepository(client)

        val result = repository.fetchReleaseByTag(
            owner = "UE-DND",
            repo = "Chronos",
            tag = "v1.0.0",
        )

        assertTrue(result is AppResult.Failure)
        assertTrue((result as AppResult.Failure).error is AppError.Network)
    }
}

private fun createRepository(
    responseCode: Int,
    responseBody: String,
): RemoteGithubReleaseRepository {
    val client = OkHttpClient.Builder()
        .addInterceptor { chain ->
            Response.Builder()
                .request(chain.request())
                .protocol(Protocol.HTTP_1_1)
                .code(responseCode)
                .message(if (responseCode in 200..299) "OK" else "Error")
                .body(
                    responseBody.toResponseBody("application/json; charset=utf-8".toMediaType()),
                )
                .build()
        }
        .build()
    return RemoteGithubReleaseRepository(client)
}
