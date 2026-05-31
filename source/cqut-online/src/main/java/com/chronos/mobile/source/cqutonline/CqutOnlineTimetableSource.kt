package com.chronos.mobile.source.cqutonline

import android.util.Log
import com.chronos.mobile.core.model.OnlineScheduleEvent
import com.chronos.mobile.core.model.OnlineSchedulePayload
import com.chronos.mobile.domain.RemoteTimetableSource
import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.asSuccess
import com.chronos.mobile.domain.result.toAppError
import java.net.CookieManager
import java.net.URI
import java.util.LinkedHashMap
import javax.inject.Inject
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import okhttp3.JavaNetCookieJar
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class CqutOnlineTimetableSource @Inject constructor(
    private val baseClient: OkHttpClient,
    private val cqutCasPasswordEncryptor: CqutCasPasswordEncryptor,
) : RemoteTimetableSource {
    private val json = Json {
        encodeDefaults = true
        ignoreUnknownKeys = true
    }

    override suspend fun fetchSchedule(
        authSnapshot: AuthSnapshot,
        weekNum: String?,
        yearTerm: String?,
    ): AppResult<OnlineSchedulePayload> {
        return try {
            val session = buildSession()
            val loginResult = login(session, authSnapshot)
            if (loginResult is AppResult.Failure) {
                loginResult
            } else {
                fetchTimetable(
                    session = session,
                    authSnapshot = authSnapshot,
                    weekNum = weekNum,
                    yearTerm = yearTerm,
                )
            }
        } catch (throwable: Throwable) {
            Log.e(TAG, "fetchSchedule crashed", throwable)
            throwable.toAppError().asFailure()
        }
    }

    private fun fetchTimetable(
        session: SessionContext,
        authSnapshot: AuthSnapshot,
        weekNum: String?,
        yearTerm: String?,
    ): AppResult<OnlineSchedulePayload> {
        val initialPayload = when (
            val result = fetchWeekEvents(
                session = session,
                authSnapshot = authSnapshot,
                weekNum = weekNum,
                yearTerm = yearTerm,
                allowReloginRetry = true,
            )
        ) {
            is AppResult.Success -> result.value
            is AppResult.Failure -> return result
        }

        val weeksToFetch = resolveWeeksToFetch(initialPayload, weekNum)
        if (weeksToFetch.size <= 1) {
            return initialPayload.asSuccess()
        }

        val targetYearTerm = yearTerm?.trim()?.takeIf { it.isNotBlank() } ?: initialPayload.yearTerm
        val payloads = mutableListOf(initialPayload)
        weeksToFetch.forEach { targetWeek ->
            val isInitialWeek = targetWeek == initialPayload.weekNum && targetYearTerm == initialPayload.yearTerm
            if (isInitialWeek) return@forEach
            when (
                val result = fetchWeekEvents(
                    session = session,
                    authSnapshot = authSnapshot,
                    weekNum = targetWeek,
                    yearTerm = targetYearTerm,
                    allowReloginRetry = true,
                )
            ) {
                is AppResult.Success -> payloads += result.value
                is AppResult.Failure -> return result
            }
        }

        return mergeWeekPayloads(initialPayload, payloads).asSuccess()
    }

    private fun fetchWeekEvents(
        session: SessionContext,
        authSnapshot: AuthSnapshot,
        weekNum: String?,
        yearTerm: String?,
        allowReloginRetry: Boolean,
    ): AppResult<OnlineSchedulePayload> {
        val body = buildJsonObject(
            "userID" to JsonPrimitive(authSnapshot.account),
            "weekNum" to weekNum?.takeIf { it.isNotBlank() }?.let(::JsonPrimitive),
            "yearTerm" to yearTerm?.takeIf { it.isNotBlank() }?.let(::JsonPrimitive),
        )
        val request = Request.Builder().url(WEEK_EVENTS_URL).post(body.toRequestBody(JSON_MEDIA_TYPE)).build()
        val payload = session.client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                return AppError.Network("在线课表请求失败：HTTP ${response.code}").asFailure()
            }
            response.body.string()
        }
        val jsonObject = when (val parsed = parsePayloadObject(payload)) {
            is AppResult.Success -> parsed.value
            is AppResult.Failure -> return parsed
        }
        if (looksLikeAuthError(jsonObject)) {
            if (!allowReloginRetry) {
                return AppError.Auth(authErrorMessage(jsonObject)).asFailure()
            }
            val loginResult = login(session, authSnapshot)
            if (loginResult is AppResult.Failure) return loginResult
            return fetchWeekEvents(session, authSnapshot, weekNum, yearTerm, allowReloginRetry = false)
        }
        return runCatching {
            json.decodeFromJsonElement(OnlineSchedulePayload.serializer(), jsonObject)
        }.fold(
            onSuccess = { it.asSuccess() },
            onFailure = { AppError.DataFormat("在线课表响应格式错误").asFailure() },
        )
    }

    private fun login(session: SessionContext, authSnapshot: AuthSnapshot): AppResult<Unit> {
        val loginPayload = buildJsonObject(
            "name" to JsonPrimitive(authSnapshot.account),
            "pwd" to JsonPrimitive(cqutCasPasswordEncryptor.encrypt(authSnapshot.password)),
            "verifyCode" to null,
            "universityId" to JsonPrimitive("100005"),
            "loginType" to JsonPrimitive("login"),
        )
        val loginRequest = Request.Builder().url(CAS_LOGIN_URL).post(loginPayload.toRequestBody(JSON_MEDIA_TYPE)).build()
        val loginJson = session.client.newCall(loginRequest).execute().use { response ->
            if (!response.isSuccessful) {
                return AppError.Network("统一身份认证登录失败：HTTP ${response.code}").asFailure()
            }
            when (val parsed = parsePayloadObject(response.body.string())) {
                is AppResult.Success -> parsed.value
                is AppResult.Failure -> return parsed
            }
        }
        val code = loginJson["code"].stringValue()
        val message = loginJson["msg"].stringValue()
        if (code != "200") {
            return AppError.Auth(message?.takeIf { it.isNotBlank() } ?: "统一身份认证登录失败").asFailure()
        }
        val ticketRequest = Request.Builder().url(CAS_TICKET_URL).get().build()
        session.client.newCall(ticketRequest).execute().use { response ->
            if (!response.isSuccessful) {
                return AppError.Network("课表系统登录失败：HTTP ${response.code}").asFailure()
            }
        }
        if (!hasSessionCookies(session.cookieManager)) {
            return AppError.Auth("登录失败，请重新输入账号或密码").asFailure()
        }
        return Unit.asSuccess()
    }

    private fun buildSession(): SessionContext {
        val cookieManager = CookieManager().apply {
            setCookiePolicy(java.net.CookiePolicy.ACCEPT_ALL)
        }
        val client = baseClient.newBuilder().cookieJar(JavaNetCookieJar(cookieManager)).build()
        return SessionContext(client = client, cookieManager = cookieManager)
    }

    private fun hasSessionCookies(cookieManager: CookieManager): Boolean {
        val cookieStore = cookieManager.cookieStore
        return SESSION_COOKIE_HOSTS.any { host ->
            (runCatching { cookieStore.get(URI("https://$host")) }.getOrNull()?.isNotEmpty()) == true
        }
    }

    private fun parsePayloadObject(raw: String): AppResult<JsonObject> = runCatching {
        val element = json.parseToJsonElement(raw)
        element as? JsonObject ?: throw IllegalArgumentException("在线课表响应格式错误")
    }.fold(
        onSuccess = { it.asSuccess() },
        onFailure = { AppError.DataFormat("在线课表响应格式错误").asFailure() },
    )

    private fun looksLikeAuthError(jsonObject: JsonObject): Boolean {
        if (jsonObject.containsKey("yearTerm") || jsonObject.containsKey("weekDayList")) return false
        return jsonObject.containsKey("code") || jsonObject.containsKey("msg")
    }

    private fun authErrorMessage(jsonObject: JsonObject): String =
        jsonObject["msg"].stringValue()?.takeIf { it.isNotBlank() } ?: "登录失败，请重新输入密码"

    private fun buildJsonObject(vararg entries: Pair<String, JsonPrimitive?>): String {
        val objectValue = JsonObject(
            buildMap {
                entries.forEach { (key, value) -> if (value != null) put(key, value) }
            },
        )
        return json.encodeToString(JsonObject.serializer(), objectValue)
    }

    private fun JsonElement?.stringValue(): String? = (this as? JsonPrimitive)?.content

    private companion object {
        const val TAG = "TransferImport"
        const val CAS_LOGIN_URL = "https://uis.cqut.edu.cn/center-auth-server/sso/doLogin"
        const val CAS_TICKET_URL =
            "https://uis.cqut.edu.cn/center-auth-server/YF8A4013/cas/login?service=https://timetable-cfc.cqut.edu.cn/api/auth/casLogin"
        const val WEEK_EVENTS_URL = "https://timetable-cfc.cqut.edu.cn/api/courseSchedule/listWeekEvents"
        val SESSION_COOKIE_HOSTS = listOf("uis.cqut.edu.cn", "timetable-cfc.cqut.edu.cn")
        val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()
    }

    private data class SessionContext(
        val client: OkHttpClient,
        val cookieManager: CookieManager,
    )
}

internal fun resolveWeeksToFetch(
    initialPayload: OnlineSchedulePayload,
    requestedWeekNum: String?,
): List<String> {
    val explicitWeek = requestedWeekNum?.trim()?.takeIf { it.isNotBlank() }
    if (explicitWeek != null) {
        return listOf(explicitWeek)
    }
    val termWeeks = initialPayload.weekList
        .map(String::trim)
        .filter(String::isNotBlank)
        .distinct()
    if (termWeeks.isNotEmpty()) {
        return termWeeks
    }
    return listOfNotNull(initialPayload.weekNum.trim().takeIf { it.isNotBlank() })
}

internal fun mergeWeekPayloads(
    initialPayload: OnlineSchedulePayload,
    payloads: List<OnlineSchedulePayload>,
): OnlineSchedulePayload {
    val mergedEvents = LinkedHashMap<OnlineScheduleEventKey, OnlineScheduleEvent>()
    payloads.forEach { payload ->
        payload.eventList.forEach { event ->
            val normalizedEvent = event.copy(
                weekNum = event.weekNum.trim(),
                weekDay = event.weekDay.trim(),
                weekList = event.weekList.map(String::trim).filter(String::isNotBlank),
                weekCover = event.weekCover.trim(),
                sessionList = event.sessionList.map(String::trim).filter(String::isNotBlank),
                sessionStart = event.sessionStart.trim(),
                sessionLast = event.sessionLast.trim(),
                eventName = event.eventName.trim(),
                address = event.address.trim(),
                memberName = event.memberName.trim(),
                duplicateGroupType = event.duplicateGroupType.trim(),
                eventType = event.eventType.trim(),
                eventID = event.eventID.trim(),
            )
            mergedEvents.putIfAbsent(
                OnlineScheduleEventKey(
                    weekDay = normalizedEvent.weekDay,
                    weekList = normalizedEvent.weekList,
                    sessionList = normalizedEvent.sessionList,
                    sessionStart = normalizedEvent.sessionStart,
                    sessionLast = normalizedEvent.sessionLast,
                    eventName = normalizedEvent.eventName,
                    address = normalizedEvent.address,
                    memberName = normalizedEvent.memberName,
                    eventType = normalizedEvent.eventType,
                ),
                normalizedEvent,
            )
        }
    }
    return initialPayload.copy(
        yearTerm = initialPayload.yearTerm.trim(),
        weekNum = initialPayload.weekNum.trim(),
        nowMonth = initialPayload.nowMonth.trim(),
        yearTermList = initialPayload.yearTermList.map(String::trim).filter(String::isNotBlank).distinct(),
        weekList = initialPayload.weekList.map(String::trim).filter(String::isNotBlank).distinct(),
        weekDayList = initialPayload.weekDayList,
        eventList = mergedEvents.values.toList(),
    )
}

private data class OnlineScheduleEventKey(
    val weekDay: String,
    val weekList: List<String>,
    val sessionList: List<String>,
    val sessionStart: String,
    val sessionLast: String,
    val eventName: String,
    val address: String,
    val memberName: String,
    val eventType: String,
)
