package com.chronos.mobile.feature.mine

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.outlined.LayersClear
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import coil3.compose.AsyncImage
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.model.TimetableCourseDisplayModel
import com.chronos.mobile.domain.model.TimetableGridModel
import com.chronos.mobile.core.timetableui.TimetableGrid

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MineWallpaperScreen(
    hasWallpaper: Boolean,
    wallpaperUri: String?,
    timetable: Timetable?,
    academicWeek: Int,
    gridModel: TimetableGridModel?,
    courseDisplayModels: List<TimetableCourseDisplayModel>,
    onBack: () -> Unit,
    onChangeWallpaper: () -> Unit,
    onClearWallpaper: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                title = { Text("课表壁纸") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "返回",
                        )
                    }
                },
            )
        },
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            if (hasWallpaper && timetable != null && gridModel != null) {
                WallpaperTimetablePreview(
                    wallpaperUri = wallpaperUri,
                    academicWeek = academicWeek,
                    gridModel = gridModel,
                    courseDisplayModels = courseDisplayModels,
                    modifier = Modifier.weight(1f),
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                if (hasWallpaper) {
                    OutlinedButton(
                        onClick = onClearWallpaper,
                        modifier = Modifier.weight(1f),
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.LayersClear,
                            contentDescription = null,
                        )
                        Spacer(modifier = Modifier.size(8.dp))
                        Text("清除壁纸")
                    }
                }

                OutlinedButton(
                    onClick = onChangeWallpaper,
                    modifier = Modifier.weight(1f),
                ) {
                    Icon(
                        imageVector = Icons.Default.PhotoLibrary,
                        contentDescription = null,
                    )
                    Spacer(modifier = Modifier.size(8.dp))
                    Text(if (hasWallpaper) "重新选择" else "选择壁纸")
                }
            }
        }
    }
}

@Composable
private fun WallpaperTimetablePreview(
    wallpaperUri: String?,
    academicWeek: Int,
    gridModel: TimetableGridModel,
    courseDisplayModels: List<TimetableCourseDisplayModel>,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .fillMaxWidth(),
    ) {
        if (!wallpaperUri.isNullOrBlank()) {
            AsyncImage(
                model = wallpaperUri.toUri(),
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        }

        TimetableGrid(
            displayedWeek = academicWeek,
            isCurrentWeek = true,
            gridModel = gridModel,
            courseDisplayModels = courseDisplayModels,
            hasWallpaper = !wallpaperUri.isNullOrBlank(),
            modifier = Modifier.fillMaxSize(),
            enableAutoCenterCurrentPeriod = false,
            enableVerticalScroll = false,
            onCourseClick = null,
            onCourseLongClick = null,
        )
    }
}
