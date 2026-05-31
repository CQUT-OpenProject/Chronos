package com.chronos.mobile.source.cqutonline

import java.security.KeyFactory
import java.security.PublicKey
import java.security.spec.X509EncodedKeySpec
import java.util.Base64
import javax.crypto.Cipher
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import kotlinx.serialization.json.Json

@Singleton
class CqutCasPasswordEncryptor @Inject constructor() {
    private val json = Json

    fun encrypt(password: String): String {
        if (password.isBlank()) return ""
        val encryptedChunks = password.chunked(CHUNK_SIZE).map { chunk ->
            val cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
            cipher.init(Cipher.ENCRYPT_MODE, publicKey)
            Base64.getEncoder().encodeToString(cipher.doFinal(chunk.toByteArray(Charsets.UTF_8)))
        }
        return java.net.URLEncoder.encode(
            json.encodeToString(ListSerializer(String.serializer()), encryptedChunks),
            Charsets.UTF_8.name(),
        )
    }

    private val publicKey: PublicKey by lazy {
        val cleaned = PUBLIC_KEY_PEM
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace("\\s".toRegex(), "")
        val decoded = Base64.getDecoder().decode(cleaned)
        KeyFactory.getInstance("RSA").generatePublic(X509EncodedKeySpec(decoded))
    }

    companion object {
        const val CHUNK_SIZE = 29
        const val PUBLIC_KEY_PEM = """
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDACwPDxYycdCiNeblZa9LjvDzb
iZU1vc9gKRcG/pGjZ/DJkI4HmoUE2r/o6SfB5az3s+H5JDzmOMVQ63hD7LZQGR4k
3iYWnCg3UpQZkZEtFtXBXsQHjKVJqCiEtK+gtxz4WnriDjf+e/CxJ7OD03e7sy5N
Y/akVmYNtghKZzz6jwIDAQAB
-----END PUBLIC KEY-----
"""
    }
}
