package com.chronos.mobile.domain

import com.chronos.mobile.domain.model.GithubRelease
import com.chronos.mobile.domain.result.AppResult

interface GithubReleaseRepository {
    suspend fun fetchReleaseByTag(
        owner: String,
        repo: String,
        tag: String,
    ): AppResult<GithubRelease>
}
