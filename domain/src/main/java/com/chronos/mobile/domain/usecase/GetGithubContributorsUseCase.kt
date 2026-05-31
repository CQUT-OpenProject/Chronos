package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.GithubContributorRepository
import com.chronos.mobile.domain.model.GithubContributor
import com.chronos.mobile.domain.result.AppResult
import javax.inject.Inject

class GetGithubContributorsUseCase @Inject constructor(
    private val repository: GithubContributorRepository,
) {
    suspend operator fun invoke(limit: Int = DEFAULT_LIMIT): AppResult<List<GithubContributor>> =
        repository.fetchContributors(
            owner = REPO_OWNER,
            repo = REPO_NAME,
            limit = limit,
        )

    private companion object {
        const val REPO_OWNER = "UE-DND"
        const val REPO_NAME = "Chronos"
        const val DEFAULT_LIMIT = 5
    }
}
