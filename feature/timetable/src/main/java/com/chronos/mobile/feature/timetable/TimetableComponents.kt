package com.chronos.mobile.feature.timetable

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.graphics.toColorInt
import com.chronos.mobile.domain.model.PeriodTimeDraft

@Composable
internal fun SwitchRow(
    title: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(title, modifier = Modifier.weight(1f))
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
internal fun PeriodTimeEditorRow(
    state: PeriodTimeDraft,
    canRemove: Boolean,
    onStartTimeChange: (String) -> Unit,
    onEndTimeChange: (String) -> Unit,
    onRemove: () -> Unit,
) {
    androidx.compose.foundation.layout.Column(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(18.dp))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = stringResource(R.string.timetable_period_title, state.index),
                style = MaterialTheme.typography.labelLarge,
                modifier = Modifier.weight(1f),
            )
            if (canRemove) {
                TextButton(onClick = onRemove) {
                    Text(stringResource(R.string.timetable_delete))
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedTextField(
                value = state.startTime,
                onValueChange = onStartTimeChange,
                label = { Text(stringResource(R.string.timetable_period_start_label)) },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            OutlinedTextField(
                value = state.endTime,
                onValueChange = onEndTimeChange,
                label = { Text(stringResource(R.string.timetable_period_end_label)) },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
        }
    }
}

@Composable
internal fun PeriodStepperRow(
    title: String,
    value: Int,
    range: IntRange,
    onValueChange: (Int) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(title, modifier = Modifier.weight(1f))
        OutlinedButton(onClick = { onValueChange((value - 1).coerceAtLeast(range.first)) }) {
            Text(stringResource(R.string.timetable_stepper_decrement))
        }
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = value.toString(),
            modifier = Modifier.width(24.dp),
            textAlign = TextAlign.Center,
        )
        Spacer(modifier = Modifier.width(8.dp))
        OutlinedButton(onClick = { onValueChange((value + 1).coerceAtMost(range.last)) }) {
            Text(stringResource(R.string.timetable_stepper_increment))
        }
    }
}

internal fun parseColor(hex: String) = androidx.compose.ui.graphics.Color(hex.toColorInt())
