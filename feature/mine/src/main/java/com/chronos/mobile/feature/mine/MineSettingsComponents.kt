package com.chronos.mobile.feature.mine

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

private val MineSectionShape = RoundedCornerShape(28.dp)
private val MineRowShape = RoundedCornerShape(22.dp)
private val MineIconShape = RoundedCornerShape(14.dp)

@Composable
internal fun MineSettingsSection(
    title: String,
    accentColor: Color,
    content: @Composable () -> Unit,
) {
    Column {
        Row(modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)) {
            Text(text = title, style = MaterialTheme.typography.titleMedium)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Surface(
            shape = MineSectionShape,
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
            border = BorderStroke(1.dp, accentColor.copy(alpha = 0.14f)),
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                content()
            }
        }
    }
}

@Composable
internal fun MineSettingsRow(
    onClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
    interactionModifier: Modifier = Modifier,
    content: @Composable RowScope.() -> Unit,
) {
    val resolvedInteractionModifier = if (onClick != null) {
        Modifier
            .clickable(onClick = onClick)
            .then(interactionModifier)
    } else {
        interactionModifier
    }

    Row(
        modifier = modifier
            .clip(MineRowShape)
            .then(resolvedInteractionModifier)
            .padding(horizontal = 4.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        content = content,
    )
}

@Composable
internal fun MineSettingsIcon(
    icon: ImageVector,
    containerColor: Color,
    iconColor: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.size(36.dp),
        shape = MineIconShape,
        color = containerColor.copy(alpha = 0.75f),
    ) {
        Box(contentAlignment = Alignment.Center) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = iconColor,
            )
        }
    }
}
