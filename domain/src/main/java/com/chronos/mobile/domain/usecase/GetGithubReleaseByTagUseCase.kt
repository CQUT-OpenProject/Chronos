package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.GithubReleaseRepository
import com.chronos.mobile.domain.model.GithubRelease
import com.chronos.mobile.domain.result.AppResult
import javax.inject.Inject

class GetGithubReleaseByTagUseCase @Inject constructor(
    private val repository: GithubReleaseRepository,
) {
    suspend operator fun invoke(appVersionName: String): AppResult<GithubRelease> =
        repository.fetchReleaseByTag(
            owner = REPO_OWNER,
            repo = REPO_NAME,
            tag = normalizeTag(appVersionName),
        )

    companion object {
        const val REPO_OWNER = "UE-DND"
        const val REPO_NAME = "Chronos"

        fun normalizeTag(appVersionName: String): String {
            val normalized = appVersionName.trim()
            if (normalized.isEmpty()) return "v0.0.0"
            return if (normalized.startsWith("v", ignoreCase = true)) {
                "v${normalized.drop(1)}"
            } else {
                "v$normalized"
            }
        }
    }
}
