package com.ficmanagerapp

import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.*

class NativeStorageModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "NativeStorage"
        private const val PREFS_NAME = "FIC_PERSISTENT_STORE"
    }

    private val prefs: SharedPreferences by lazy {
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun setItem(key: String, value: String, promise: Promise) {
        try {
            prefs.edit().putString(key, value).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STORAGE_ERROR", "Failed to save item: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getItem(key: String, promise: Promise) {
        try {
            val value = prefs.getString(key, null)
            promise.resolve(value)
        } catch (e: Exception) {
            promise.reject("STORAGE_ERROR", "Failed to retrieve item: ${e.message}", e)
        }
    }

    @ReactMethod
    fun removeItem(key: String, promise: Promise) {
        try {
            prefs.edit().remove(key).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STORAGE_ERROR", "Failed to remove item: ${e.message}", e)
        }
    }

    @ReactMethod
    fun clear(promise: Promise) {
        try {
            prefs.edit().clear().apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STORAGE_ERROR", "Failed to clear storage: ${e.message}", e)
        }
    }
}

