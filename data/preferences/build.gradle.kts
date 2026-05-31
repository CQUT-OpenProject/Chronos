plugins {
    id("chronos.android.library")
    id("chronos.android.hilt")
}

android {
    namespace = "com.chronos.mobile.data.preferences"
}

dependencies {
    implementation(project(":core:model"))
    implementation(libs.androidx.datastore.preferences)
}
