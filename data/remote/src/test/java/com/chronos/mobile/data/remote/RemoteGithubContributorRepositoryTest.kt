package com.chronos.mobile.data.remote

import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import java.net.UnknownHostException
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.Protocol
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import okhttp3.MediaType.Companion.toMediaType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class RemoteGithubContributorRepositoryTest {
    @Test
    fun `fetchContributors parses contributors list`() = runBlocking {
        val repository = createRepository(
            responseCode = 200,
            responseBody = """
                [
                  {
                    "login": "UE-DND",
                    "avatar_url": "https://avatars.githubusercontent.com/u/100979820?v=4",
                    "html_url": "https://github.com/UE-DND",
                    "contributions": 13,
                    "type": "User"
                  }
                ]
            """.trimIndent(),
        )

        val result = repository.fetchContributors(
            owner = "UE-DND",
            repo = "Chronos",
            limit = 5,
        )

        assertTrue(result is AppResult.Success)
        val contributors = (result as AppResult.Success).value
        assertEquals(1, contributors.size)
        assertEquals("UE-DND", contributors.first().login)
        assertEquals(13, contributors.first().contributions)
    }

    @Test
    fun `fetchContributors handles empty list`() = runBlocking {
        val repository = createRepository(
            responseCode = 200,
            responseBody = "[]",
        )

        val result = repository.fetchContributors(
            owner = "UE-DND",
            repo = "Chronos",
            limit = 5,
        )

        assertTrue(result is AppResult.Success)
        assertTrue((result as AppResult.Success).value.isEmpty())
    }

    @Test
    fun `fetchContributors returns data format failure when payload is invalid`() = runBlocking {
        val repository = createRepository(
            responseCode = 200,
            responseBody = "{ invalid json",
        )

        val result = repository.fetchContributors(
            owner = "UE-DND",
            repo = "Chronos",
            limit = 5,
        )

        assertTrue(result is AppResult.Failure)
        assertTrue((result as AppResult.Failure).error is AppError.DataFormat)
    }

    @Test
    fun `fetchContributors maps network exception to network error`() = runBlocking {
        val client = OkHttpClient.Builder()
            .addInterceptor { throw UnknownHostException("unreachable") }
            .build()
        val repository = RemoteGithubContributorRepository(client)

        val result = repository.fetchContributors(
            owner = "UE-DND",
            repo = "Chronos",
            limit = 5,
        )

        assertTrue(result is AppResult.Failure)
        assertTrue((result as AppResult.Failure).error is AppError.Network)
    }

    @Test
    fun `fetchContributors maps github message object to network error`() = runBlocking {
        val repository = createRepository(
            responseCode = 200,
            responseBody = """
                {
                  "message": "API rate limit exceeded"
                }
            """.trimIndent(),
        )

        val result = repository.fetchContributors(
            owner = "UE-DND",
            repo = "Chronos",
            limit = 5,
        )

        assertTrue(result is AppResult.Failure)
        val error = (result as AppResult.Failure).error
        assertTrue(error is AppError.Network)
        assertEquals("API rate limit exceeded", error.message)
    }

    private fun createRepository(
        responseCode: Int,
        responseBody: String,
    ): RemoteGithubContributorRepository {
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
        return RemoteGithubContributorRepository(client)
    }
}
