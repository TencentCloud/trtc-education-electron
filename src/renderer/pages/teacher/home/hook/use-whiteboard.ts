import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  TRTCScreenCaptureSourceInfo,
  Rect,
  TRTCVideoEncParam,
  TRTCVideoResolution,
  TRTCVideoResolutionMode,
} from 'trtc-electron-sdk/liteav/trtc_define';
import logger from '../../../../utils/logger';
import { tuiRoomCore } from '../../../../core/room-core';
import { EWindowMode } from '../../../../../types';

function useWhiteboard(props: { windowMode: EWindowMode }) {
  const logPrefix = '[useWhiteboard]';

  const { windowMode } = props;
  const [whiteboardWindow, setWhiteboardWindow] =
    useState<TRTCScreenCaptureSourceInfo | null>(null);
  const [whiteboardBound, setWhiteboardBound] = useState<DOMRect | null>(null);

  const platform = useSelector((state: any) => state.user.platform);
  const currentWindowID = useSelector(
    (state: any) => state.env.currentWindowID
  );

  // 开始白板分享
  const startShareWhiteBoard = useCallback(() => {
    logger.log(
      `${logPrefix}.startShareWhiteBoard:`,
      whiteboardWindow,
      whiteboardBound,
      platform
    );
    if (
      windowMode === EWindowMode.Whiteboard &&
      whiteboardWindow &&
      whiteboardBound &&
      platform
    ) {
      const menubarAddToolbarHeight = window.outerHeight - window.innerHeight;

      let selectRect = null;
      if (platform === 'win32') {
        // windows
        const devicePixelRatio = window.devicePixelRatio || 1;
        selectRect = new Rect(
          whiteboardBound.left * devicePixelRatio,
          (whiteboardBound.top + menubarAddToolbarHeight) * devicePixelRatio,
          whiteboardBound.right * devicePixelRatio,
          (whiteboardBound.bottom + menubarAddToolbarHeight) * devicePixelRatio
        );
      } else {
        // mac
        selectRect = new Rect(
          whiteboardBound.left,
          whiteboardBound.top + menubarAddToolbarHeight,
          whiteboardBound.right,
          whiteboardBound.bottom + menubarAddToolbarHeight
        );
      }

      const screenShareEncParam = new TRTCVideoEncParam(
        TRTCVideoResolution.TRTCVideoResolution_1920_1080,
        TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape,
        15,
        1600,
        0,
        true
      );
      tuiRoomCore.selectScreenCaptureTarget(
        whiteboardWindow.type,
        whiteboardWindow.sourceId,
        whiteboardWindow.sourceName,
        selectRect,
        true, // mouse
        false // highlight
      );
      // 此处不需要预览，所以位置的DOM容器元素传 null
      tuiRoomCore.startScreenCapture(null, screenShareEncParam);
    }
  }, [whiteboardWindow, whiteboardBound, platform, windowMode]);

  // 获取白板所在 Windows 窗口信息，用于通过屏幕分享功能分享出去
  useEffect(() => {
    logger.log(`${logPrefix}useEffect get whiteboard window`);
    if (currentWindowID) {
      const screenCaptureList: Array<TRTCScreenCaptureSourceInfo> =
        tuiRoomCore.getScreenCaptureSources(160, 90, 32, 32);
      logger.log(
        `${logPrefix}useEffect get whiteboard screen screenCaptureList:`,
        screenCaptureList
      );
      const targetWindows = screenCaptureList.filter(
        (screen) => screen.sourceId === currentWindowID
      );

      if (targetWindows && targetWindows.length) {
        setWhiteboardWindow(targetWindows[0]);
      }
    }
  }, [currentWindowID]);

  // 窗口处于白板分享模式，则白板窗口信息和白板尺寸数据被赋值后，启动白板分享
  useEffect(() => {
    logger.info(
      `${logPrefix}useEffect start sharing:`,
      whiteboardWindow,
      whiteboardBound
    );
    if (
      windowMode === EWindowMode.Whiteboard &&
      whiteboardWindow &&
      whiteboardBound &&
      whiteboardBound.left !== undefined
    ) {
      startShareWhiteBoard();
    }
  }, [whiteboardWindow, whiteboardBound, windowMode, startShareWhiteBoard]);

  return {
    setWhiteboardBound,
    startShareWhiteBoard,
  };
}

export default useWhiteboard;
