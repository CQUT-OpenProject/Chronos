package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.GithubReleaseRepository
import com.chronos.mobile.domain.model.GithubRelease
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class GetGithubReleaseByTagUseCaseTest {
    @Test
    fun `invoke passes repository and returns success result`() = runBlocking {
        val repository = FakeGithubReleaseRepository(
            result = AppResult.Success(
                GithubRelease(
                    tagName = "v1.0.0",
                    name = "Chronos 1.0.0",
                    publishedAt = "2026-03-21T00:00:00Z",
                    body = "Release notes",
                    htmlUrl = "https://github.com/UE-DND/Chronos/releases/tag/v1.0.0",
                ),
            ),
        )
        val useCase = GetGithubReleaseByTagUseCase(repository)

        val result = useCase("1.0.0")

        assertTrue(result is AppResult.Success)
        assertEquals("UE-DND", repository.lastOwner)
        assertEquals("Chronos", repository.lastRepo)
        assertEquals("v1.0.0", repository.lastTag)
    }

    @Test
    fun `invoke keeps v prefix when version already has it`() = runBlocking {
        val repository = FakeGithubReleaseRepository(
            result = AppError.Network("network failed").asFailure(),
        )
        val useCase = GetGithubReleaseByTagUseCase(repository)

        val result = useCase("v1.0.0")

        assertTrue(result is AppResult.Failure)
        assertEquals("v1.0.0", repository.lastTag)
    }
}

private class FakeGithubReleaseRepository(
    var result: AppResult<GithubRelease>,
) : GithubReleaseRepository {
    var lastOwner: String? = null
    var lastRepo: String? = null
    var lastTag: String? = null

    override suspend fun fetchReleaseByTag(
        owner: String,
        repo: String,
        tag: String,
    ): AppResult<GithubRelease> {
        lastOwner = owner
        lastRepo = repo
        lastTag = tag
        return result
    }
}
