package com.chronos.mobile.feature.root

import android.view.HapticFeedbackConstants
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalView

@Composable
internal fun ChronosBottomBar(
    activeTab: RootTab,
    onTabSelected: (RootTab) -> Unit,
) {
    val view = LocalView.current
    NavigationBar(
        windowInsets = WindowInsets(0, 0, 0, 0),
    ) {
        NavigationBarItem(
            selected = activeTab == RootTab.TIMETABLE,
            onClick = {
                if (activeTab != RootTab.TIMETABLE) {
                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                }
                onTabSelected(RootTab.TIMETABLE)
            },
            icon = {
                Icon(
                    imageVector = if (activeTab == RootTab.TIMETABLE) {
                        Icons.Filled.CalendarMonth
                    } else {
                        Icons.Outlined.CalendarMonth
                    },
                    contentDescription = "课表",
                )
            },
            label = { Text("课表") },
        )
        NavigationBarItem(
            selected = activeTab == RootTab.MINE,
            onClick = {
                if (activeTab != RootTab.MINE) {
                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                }
                onTabSelected(RootTab.MINE)
            },
            icon = {
                Icon(
                    imageVector = if (activeTab == RootTab.MINE) Icons.Filled.Person else Icons.Outlined.Person,
                    contentDescription = "我的",
                )
            },
            label = { Text("我的") },
        )
    }
}
