package com.chronos.mobile.feature.mine

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ListAlt
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.IosShare
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Wallpaper
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

@Composable
fun MineRoute(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(),
    hasWallpaper: Boolean,
    onManageTimetables: () -> Unit,
    onImport: () -> Unit,
    onExport: () -> Unit,
    onOpenThemeSettings: () -> Unit,
    onChangeWallpaper: () -> Unit,
    onOpenAbout: () -> Unit,
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(
            top = contentPadding.calculateTopPadding() + 12.dp,
            bottom = contentPadding.calculateBottomPadding() + 24.dp,
        ),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        item {
            Text(
                text = "我的",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(horizontal = 8.dp),
            )
        }
        item {
            MineSettingsSection(
                title = "课表管理",
                accentColor = MaterialTheme.colorScheme.primary,
            ) {
                MineRow(
                    icon = Icons.AutoMirrored.Filled.ListAlt,
                    iconContainerColor = MaterialTheme.colorScheme.primaryContainer,
                    iconColor = MaterialTheme.colorScheme.onPrimaryContainer,
                    title = "管理课程表",
                    onClick = onManageTimetables,
                )
            }
        }
        item {
            MineSettingsSection(
                title = "数据与分享",
                accentColor = MaterialTheme.colorScheme.tertiary,
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    MineRow(
                        icon = Icons.Default.Download,
                        iconContainerColor = MaterialTheme.colorScheme.secondaryContainer,
                        iconColor = MaterialTheme.colorScheme.onSecondaryContainer,
                        title = "导入课程表",
                        onClick = onImport,
                    )
                    MineRow(
                        icon = Icons.Default.IosShare,
                        iconContainerColor = MaterialTheme.colorScheme.tertiaryContainer,
                        iconColor = MaterialTheme.colorScheme.onTertiaryContainer,
                        title = "分享课程表（导出）",
                        onClick = onExport,
                    )
                }
            }
        }
        item {
            MineSettingsSection(
                title = "个性化",
                accentColor = MaterialTheme.colorScheme.secondary,
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    MineRow(
                        icon = Icons.Default.Palette,
                        iconContainerColor = MaterialTheme.colorScheme.secondaryContainer,
                        iconColor = MaterialTheme.colorScheme.onSecondaryContainer,
                        title = "主题设置",
                        onClick = onOpenThemeSettings,
                    )
                    MineRow(
                        icon = Icons.Default.Wallpaper,
                        iconContainerColor = MaterialTheme.colorScheme.primaryContainer,
                        iconColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        title = if (hasWallpaper) "壁纸设置" else "设置课表壁纸",
                        onClick = onChangeWallpaper,
                    )
                }
            }
        }
        item {
            MineSettingsSection(
                title = "关于与反馈",
                accentColor = MaterialTheme.colorScheme.tertiary,
            ) {
                MineRow(
                    icon = Icons.Default.Info,
                    iconContainerColor = MaterialTheme.colorScheme.tertiaryContainer,
                    iconColor = MaterialTheme.colorScheme.onTertiaryContainer,
                    title = "关于 Chronos",
                    onClick = onOpenAbout,
                )
            }
        }
        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun MineRow(
    icon: ImageVector,
    iconContainerColor: Color,
    iconColor: Color,
    title: String,
    onClick: () -> Unit,
) {
    MineSettingsRow(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
    ) {
        MineSettingsIcon(
            icon = icon,
            containerColor = iconContainerColor,
            iconColor = iconColor,
        )
        Spacer(modifier = Modifier.width(14.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(1f),
        )
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            modifier = Modifier.size(18.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
