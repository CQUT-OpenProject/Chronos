package com.chronos.mobile.domain

import com.chronos.mobile.domain.model.GithubContributor
import com.chronos.mobile.domain.result.AppResult

interface GithubContributorRepository {
    suspend fun fetchContributors(
        owner: String,
        repo: String,
        limit: Int,
    ): AppResult<List<GithubContributor>>
}
