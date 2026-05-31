package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.TimetableRepository
import javax.inject.Inject

class SetWallpaperUseCase @Inject constructor(
    private val repository: TimetableRepository,
) {
    suspend operator fun invoke(uri: String?) {
        repository.setWallpaper(uri)
    }
}
