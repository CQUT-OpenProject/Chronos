@file:OptIn(
    kotlinx.serialization.ExperimentalSerializationApi::class,
    kotlinx.serialization.InternalSerializationApi::class,
)

package com.chronos.mobile.core.model

import androidx.compose.runtime.Immutable
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonNames

@Serializable
@Immutable
data class OnlineSchedulePayload(
    // yt = yearTerm, 学年学期
    @SerialName("yt") @JsonNames("yearTerm")
    val yearTerm: String = "",
    // wn = weekNum, 当前周次
    @SerialName("wn") @JsonNames("weekNum")
    val weekNum: String = "",
    // nm = nowMonth, 当前月份
    @SerialName("nm") @JsonNames("nowMonth")
    val nowMonth: String = "",
    // is = importSource, 导入来源
    @SerialName("is") @JsonNames("importSource")
    val importSource: String = "",
    // ts = termStartDate, 学期起始日期（yyyy-MM-dd，可选）
    @SerialName("ts") @JsonNames("termStartDate")
    val termStartDate: String? = null,
    // yl = yearTermList, 学期列表
    @SerialName("yl") @JsonNames("yearTermList")
    val yearTermList: List<String> = emptyList(),
    // wl = weekList, 周次列表
    @SerialName("wl") @JsonNames("weekList")
    val weekList: List<String> = emptyList(),
    // wd = weekDayList, 星期日期列表
    @SerialName("wd") @JsonNames("weekDayList")
    val weekDayList: List<OnlineScheduleWeekDay> = emptyList(),
    // el = eventList, 课程事件列表
    @SerialName("el") @JsonNames("eventList")
    val eventList: List<OnlineScheduleEvent> = emptyList(),
)

@Serializable
@Immutable
data class OnlineScheduleWeekDay(
    // wd = weekDay, 星期
    @SerialName("wd") @JsonNames("weekDay")
    val weekDay: String = "",
    // dt = weekDate, 日期（MM/dd）
    @SerialName("dt") @JsonNames("weekDate")
    val weekDate: String = "",
    // td = today, 是否今天
    @SerialName("td") @JsonNames("today")
    val today: Boolean = false,
)

@Serializable
@Immutable
data class OnlineScheduleEvent(
    // wn = weekNum, 当前周次
    @SerialName("wn") @JsonNames("weekNum")
    val weekNum: String = "",
    // wd = weekDay, 星期（1-7）
    @SerialName("wd") @JsonNames("weekDay")
    val weekDay: String = "",
    // wl = weekList, 上课周次列表
    @SerialName("wl") @JsonNames("weekList")
    val weekList: List<String> = emptyList(),
    // wc = weekCover, 周次压缩文本
    @SerialName("wc") @JsonNames("weekCover")
    val weekCover: String = "",
    // sl = sessionList, 节次列表
    @SerialName("sl") @JsonNames("sessionList")
    val sessionList: List<String> = emptyList(),
    // ss = sessionStart, 起始节次
    @SerialName("ss") @JsonNames("sessionStart")
    val sessionStart: String = "",
    // se = sessionLast, 连续节数
    @SerialName("se") @JsonNames("sessionLast")
    val sessionLast: String = "",
    // en = eventName, 课程名
    @SerialName("en") @JsonNames("eventName")
    val eventName: String = "",
    // ad = address, 上课地点
    @SerialName("ad") @JsonNames("address")
    val address: String = "",
    // mn = memberName, 任课教师
    @SerialName("mn") @JsonNames("memberName")
    val memberName: String = "",
    // rm = remark, 课程备注
    @SerialName("rm") @JsonNames("remark")
    val remark: String = "",
    // gt = duplicateGroupType, 重复分组类型
    @SerialName("gt") @JsonNames("duplicateGroupType")
    val duplicateGroupType: String = "",
    // dg = duplicateGroup, 重复分组值
    @SerialName("dg") @JsonNames("duplicateGroup")
    val duplicateGroup: Int = 0,
    // et = eventType, 事件类型
    @SerialName("et") @JsonNames("eventType")
    val eventType: String = "",
    // id = eventID, 事件 ID
    @SerialName("id") @JsonNames("eventID")
    val eventID: String = "",
)
