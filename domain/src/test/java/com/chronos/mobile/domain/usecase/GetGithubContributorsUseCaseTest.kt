package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.GithubContributorRepository
import com.chronos.mobile.domain.model.GithubContributor
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class GetGithubContributorsUseCaseTest {
    @Test
    fun `invoke passes repository and returns success result`() = runBlocking {
        val repository = FakeGithubContributorRepository(
            result = AppResult.Success(
                listOf(
                    GithubContributor(
                        login = "UE-DND",
                        avatarUrl = "https://avatars.githubusercontent.com/u/100979820?v=4",
                        profileUrl = "https://github.com/UE-DND",
                        contributions = 13,
                        type = "User",
                    ),
                ),
            ),
        )
        val useCase = GetGithubContributorsUseCase(repository)

        val result = useCase()

        assertTrue(result is AppResult.Success)
        assertEquals("UE-DND", repository.lastOwner)
        assertEquals("Chronos", repository.lastRepo)
        assertEquals(5, repository.lastLimit)
    }

    @Test
    fun `invoke forwards requested limit and failure`() = runBlocking {
        val repository = FakeGithubContributorRepository(
            result = AppError.Network("network failed").asFailure(),
        )
        val useCase = GetGithubContributorsUseCase(repository)

        val result = useCase(limit = 3)

        assertTrue(result is AppResult.Failure)
        assertEquals(3, repository.lastLimit)
        assertEquals("network failed", (result as AppResult.Failure).error.message)
    }
}

private class FakeGithubContributorRepository(
    var result: AppResult<List<GithubContributor>>,
) : GithubContributorRepository {
    var lastOwner: String? = null
    var lastRepo: String? = null
    var lastLimit: Int? = null

    override suspend fun fetchContributors(
        owner: String,
        repo: String,
        limit: Int,
    ): AppResult<List<GithubContributor>> {
        lastOwner = owner
        lastRepo = repo
        lastLimit = limit
        return result
    }
}
