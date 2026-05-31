package com.chronos.mobile.domain

import java.time.LocalDate
import java.time.LocalTime
import javax.inject.Inject

interface TimeProvider {
    fun today(): LocalDate
    fun currentTime(): LocalTime
    fun currentTimeMillis(): Long
}

class SystemTimeProvider @Inject constructor() : TimeProvider {
    override fun today(): LocalDate = LocalDate.now()

    override fun currentTime(): LocalTime = LocalTime.now()

    override fun currentTimeMillis(): Long = System.currentTimeMillis()
}
