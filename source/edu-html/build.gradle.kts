plugins {
    id("chronos.android.library")
    id("chronos.android.hilt")
}

android {
    namespace = "com.chronos.mobile.source.eduhtml"
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":domain"))
    implementation(libs.jsoup)
    testImplementation(libs.junit4)
}
