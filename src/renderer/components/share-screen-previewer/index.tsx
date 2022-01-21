import React, { useEffect, useRef } from 'react';
import {
  TRTCScreenCaptureSourceInfo,
  Rect,
  TRTCVideoEncParam,
  TRTCVideoResolution,
  TRTCVideoResolutionMode,
} from 'trtc-electron-sdk/liteav/trtc_define';
import { tuiRoomCore } from '../../core/room-core';
import './index.scss';

interface PropsType {
  screenInfo: TRTCScreenCaptureSourceInfo | null;
  isSharing: boolean;
}

function ShareScreenPreviewer(props: PropsType) {
  const { screenInfo, isSharing } = props;
  const refScreenSharing = useRef(null);

  /**
   * 根据初始化参数，启动或结束屏幕分享
   *
   * 首次进入当前页面窗口，或者从隐藏窗口变成可见窗口时，根据参数启动屏幕分享；
   * 隐藏页面窗口时，结束屏幕分享
   */
  useEffect(() => {
    if (isSharing && screenInfo && refScreenSharing.current) {
      const selectRect = new Rect();
      const screenShareEncParam = new TRTCVideoEncParam(
        TRTCVideoResolution.TRTCVideoResolution_1920_1080,
        TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape,
        15,
        1600,
        0,
        true
      );
      tuiRoomCore.selectScreenCaptureTarget(
        screenInfo.type,
        screenInfo.sourceId,
        screenInfo.sourceName,
        selectRect,
        true, // mouse
        true // highlight
      );
      tuiRoomCore.startScreenCapture(
        refScreenSharing.current,
        screenShareEncParam
      );
    } else {
      tuiRoomCore.stopScreenCapture();
    }
  }, [isSharing, screenInfo]);

  return (
    <div className="com-preview-screen">
      {isSharing && (
        <div className="screen-sharing-preview" ref={refScreenSharing} />
      )}
    </div>
  );
}

export default ShareScreenPreviewer;
