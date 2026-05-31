package com.chronos.mobile.core.timetableui

import androidx.compose.ui.graphics.Color
import androidx.core.graphics.toColorInt

fun parseColor(hex: String): Color = Color(hex.toColorInt())
