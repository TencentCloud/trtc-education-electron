import React, { useState, useEffect } from 'react';
import { TRTCScreenCaptureSourceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import { EUserEventNames } from '../../../../constants';
import { EWindowSizeMode } from '../../../../types';
import logger from '../../../utils/logger';
import ShareScreenPreviewer from '../../../components/share-screen-previewer';
import './index.scss';

function SharePreview() {
  const logPrefix = '[SharePreview]';
  const [isSharing, setIsSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [screenInfo, setScreenInfo] =
    useState<TRTCScreenCaptureSourceInfo | null>(null);

  const onToggleWindowSize = () => {
    const newMode = !isMinimized;
    setIsMinimized(newMode);
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_SHARE_PREVIEW_MODE,
      {
        mode: newMode ? EWindowSizeMode.Minimize : EWindowSizeMode.Maximize,
      }
    );
  };

  // 初始化时，设置初始数据
  useEffect(() => {
    logger.log(`enter ${logPrefix}.useEffect ON_INIT_DATA:`);
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_INIT_DATA,
      (event: any, args: any) => {
        logger.log(`${logPrefix}.init-share-screen: `, event, args);
        setIsSharing(true);
        setScreenInfo(
          args.currentUser.sharingScreenInfo as TRTCScreenCaptureSourceInfo
        );
      }
    );
  }, []);

  // 退出屏幕分享（窗口隐藏）
  useEffect(() => {
    logger.log(`enter ${logPrefix}.useEffect ON_STOP_SHARE_SCREEN_WINDOW:`);
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_STOP_SHARE_SCREEN_WINDOW,
      (event: any, args: any) => {
        logger.log(`${logPrefix}.exit-share-screen: `, event, args);
        // 修改数据，驱动 React 组件结束屏幕分享
        setIsSharing(false);
        setScreenInfo(null);
      }
    );
  }, []);

  return (
    <div className="page-share-preview">
      <div className="top-tool-bar float-clearfix">
        <div className="float-left">
          <span className="icon-in-class"> </span>
          <span>In Class - Preview Sharing</span>
        </div>
        <div className="float-right">
          {!isMinimized ? (
            <button
              type="button"
              aria-label="Minimize"
              className="icon-min"
              onClick={onToggleWindowSize}
            />
          ) : (
            <button
              type="button"
              aria-label="Maximize"
              className="icon-max"
              onClick={onToggleWindowSize}
            />
          )}
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className="sharing-content">
            <ShareScreenPreviewer
              screenInfo={screenInfo}
              isSharing={isSharing}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default SharePreview;
