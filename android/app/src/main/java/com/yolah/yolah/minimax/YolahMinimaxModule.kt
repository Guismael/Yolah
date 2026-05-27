package com.yolah.yolah.minimax

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class YolahMinimaxModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    init {
      System.loadLibrary("yolah_mcts")
    }
  }

  override fun getName(): String = "YolahMinimax"

  private external fun nativeGetBestMoveMinimax(
    black: String,
    white: String,
    empty: String,
    blackScore: Int,
    whiteScore: Int,
    ply: Int,
    depth: Int
  ): String

  @ReactMethod
  fun getBestMoveWithMinimax(
    black: String,
    white: String,
    empty: String,
    blackScore: Int,
    whiteScore: Int,
    ply: Int,
    depth: Int,
    promise: Promise
  ) {
    try {
      val move = nativeGetBestMoveMinimax(
        black,
        white,
        empty,
        blackScore,
        whiteScore,
        ply,
        depth
      )
      promise.resolve(move)
    } catch (e: Throwable) {
      promise.reject("MINIMAX_NATIVE_ERROR", e)
    }
  }
}
