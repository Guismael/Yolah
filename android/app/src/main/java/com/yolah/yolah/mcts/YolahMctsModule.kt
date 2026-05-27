package com.yolah.yolah.mcts

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class YolahMctsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    init {
      System.loadLibrary("yolah_mcts")
    }
  }

  override fun getName(): String = "YolahMcts"

  private external fun nativeGetBestMove(
    black: String,
    white: String,
    empty: String,
    blackScore: Int,
    whiteScore: Int,
    ply: Int,
    iterations: Int,
    timeLimitSeconds: Double
  ): String

  @ReactMethod
  fun getBestMoveWithMCTS(
    black: String,
    white: String,
    empty: String,
    blackScore: Int,
    whiteScore: Int,
    ply: Int,
    iterations: Int,
    timeLimitSeconds: Double,
    promise: Promise
  ) {
    try {
      val move = nativeGetBestMove(
        black,
        white,
        empty,
        blackScore,
        whiteScore,
        ply,
        iterations,
        timeLimitSeconds
      )
      promise.resolve(move)
    } catch (e: Throwable) {
      promise.reject("MCTS_NATIVE_ERROR", e)
    }
  }
}
