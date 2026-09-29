package com.nova.app.bridge

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.os.Build
import android.webkit.JavascriptInterface
import android.widget.Toast
import com.nova.app.BuildConfig
import com.nova.app.MainActivity

class WebViewBridge(@SuppressLint("StaticFieldLeak") private val activity: MainActivity) {

    /**
     * Show a native toast notification
     * @param message The message to display
     * @param duration "short" or "long"
     */
    @JavascriptInterface
    fun showToast(message: String, duration: String = "short") {
        val length = if (duration.lowercase() == "long") Toast.LENGTH_LONG else Toast.LENGTH_SHORT
        Toast.makeText(activity, message, length).show()
    }

    /**
     * Get the backend URL from BuildConfig
     */
    @JavascriptInterface
    fun getBackendUrl(): String {
        return BuildConfig.BACKEND_URL
    }

    /**
     * Get app name
     */
    @JavascriptInterface
    fun getAppName(): String {
        return BuildConfig.APP_NAME
    }

    /**
     * Open file picker
     */
    @JavascriptInterface
    fun pickFile(mimeType: String = "*/*") {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = mimeType
            addCategory(Intent.CATEGORY_OPENABLE)
        }
        activity.startActivityForResult(
            Intent.createChooser(intent, "Select File"),
            FILE_PICKER_REQUEST_CODE
        )
    }

    /**
     * Share content to other apps
     * @param title Title of the share dialog
     * @param text Text to share
     */
    @JavascriptInterface
    fun shareContent(title: String, text: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, title)
            putExtra(Intent.EXTRA_TEXT, text)
        }
        activity.startActivity(Intent.createChooser(intent, "Share"))
    }

    /**
     * Exit/close the app
     */
    @JavascriptInterface
    fun closeApp() {
        activity.finish()
    }

    /**
     * Toggle fullscreen mode
     * @param enable true to enable, false to disable
     */
    @JavascriptInterface
    fun toggleFullscreen(enable: Boolean) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = activity.window.insetsController
            if (enable) {
                controller?.hide(android.view.WindowInsets.Type.systemBars())
            } else {
                controller?.show(android.view.WindowInsets.Type.systemBars())
            }
        } else {
            @Suppress("DEPRECATION")
            if (enable) {
                activity.window.decorView.systemUiVisibility = (
                    android.view.View.SYSTEM_UI_FLAG_FULLSCREEN or
                    android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                    android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                )
            } else {
                @Suppress("DEPRECATION")
                activity.window.decorView.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_VISIBLE
            }
        }
    }

    /**
     * Log a message (useful for debugging)
     * @param tag Log tag
     * @param message Log message
     */
    @JavascriptInterface
    fun log(tag: String, message: String) {
        android.util.Log.d(tag, message)
    }

    companion object {
        private const val FILE_PICKER_REQUEST_CODE = 1001
    }
}
