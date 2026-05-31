@file:OptIn(kotlinx.serialization.InternalSerializationApi::class)

package com.chronos.mobile.core.model

import androidx.compose.runtime.Immutable
import kotlinx.serialization.Serializable

@Serializable
@Immutable
data class Course(
    val id: String,
    val name: String,
    val teacher: String,
    val location: String,
    val dayOfWeek: Int,
    val startPeriod: Int,
    val endPeriod: Int,
    val color: String,
    val textColor: String = "#21005D",
    val weeks: List<Int> = emptyList(),
    val remark: String = "",
)
