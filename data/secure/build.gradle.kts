plugins {
    id("chronos.android.library")
    id("chronos.android.hilt")
}

android {
    namespace = "com.chronos.mobile.data.secure"
}

dependencies {
    implementation(project(":domain"))
    implementation(libs.androidx.biometric)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.kotlinx.coroutines.android)
}
