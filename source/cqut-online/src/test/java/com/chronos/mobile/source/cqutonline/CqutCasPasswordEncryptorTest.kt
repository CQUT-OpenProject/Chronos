package com.chronos.mobile.source.cqutonline

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CqutCasPasswordEncryptorTest {
    private val encryptor = CqutCasPasswordEncryptor()

    @Test
    fun `encrypt returns empty string for blank password`() {
        assertEquals("", encryptor.encrypt(""))
    }

    @Test
    fun `encrypt returns encoded payload for non blank password`() {
        val encrypted = encryptor.encrypt("123456")
        assertTrue(encrypted.isNotBlank())
        assertTrue(encrypted.contains("%") || encrypted.contains("%5B"))
    }
}
