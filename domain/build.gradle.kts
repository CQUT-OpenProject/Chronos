plugins {
    id("chronos.android.library")
}

android {
    namespace = "com.chronos.mobile.domain"
}

dependencies {
    implementation(project(":core:model"))
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.runtime)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.javax.inject)
    implementation(libs.jsoup)
    testImplementation(libs.junit4)
    testImplementation(libs.kotlinx.serialization.json)
}
