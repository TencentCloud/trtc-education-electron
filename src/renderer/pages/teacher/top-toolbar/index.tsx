import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { EUserEventNames } from '../../../../constants';
import Toolbar from './section/toolbar';
import logger from '../../../utils/logger';
import {
  updateDeviceState,
  updateAllStudentMuteState,
  updateRollState,
} from '../../../store/user/userSlice';
import { EEventSource } from '../../../../types';
import './index.scss';

function TopToolbarPage() {
  const logPrefix = '[TopToolbarPage]';
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.user);
  const cameraList = useSelector((state: any) => state.device.cameraList);
  const microphoneList = useSelector(
    (state: any) => state.device.microphoneList
  );
  const speakerList = useSelector((state: any) => state.device.speakerList);
  const { isAllStudentMuted, platform, classStartTime, isRolled } = currentUser;

  // 打开麦克风、扬声器选择Popup
  const onOpenMicSpeakerSelectPopup = (anchorBounds: DOMRect) => {
    logger.debug(
      `${logPrefix}onOpenMicSpeakerSelectPopup anchorBounds:`,
      anchorBounds
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_OPEN_MIC_SPEAKER_SELECT_POPUP,
      {
        anchorBounds: JSON.parse(JSON.stringify(anchorBounds)), // DOMRect 不支持序列化，需要转为普通对象
        eventSource: EEventSource.TopToolbarWindow,
      }
    );
  };

  // 更新麦克风状态：静音/取消静音
  const updateMicMuteState = (mute: boolean) => {
    dispatch(
      updateDeviceState({
        isMicMuted: mute,
      })
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_UPDATE_MIC_STATE_FROM_TOP_TOOLBAR,
      {
        isMicMuted: mute,
      }
    );
  };

  // 打开摄像头选择Popup
  const onOpenCameraSelectPopup = (anchorBounds: DOMRect) => {
    logger.debug(
      `${logPrefix}onOpenCameraSelectPopup anchorBounds:`,
      anchorBounds
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_OPEN_CAMERA_SELECT_POPUP,
      {
        anchorBounds: JSON.parse(JSON.stringify(anchorBounds)), // DOMRect 不支持序列化，需要转为普通对象
        eventSource: EEventSource.TopToolbarWindow,
      }
    );
  };

  // 更新摄像头状态：开启/关闭
  const updateCameraState = (started: boolean) => {
    dispatch(
      updateDeviceState({
        isCameraStarted: started,
      })
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_UPDATE_CAMERA_STATE_FROM_TOP_TOOLBAR,
      {
        isCameraStarted: started,
      }
    );
  };

  // 更改分享的屏幕/窗口
  const onChangeSharing = () => {
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_SELECT_SHARE_SCREEN_WINDOW,
      {}
    );
  };

  // 通知主进程停止屏幕分享，主进程会通知所有相关窗口做相应处理，并隐藏当前窗口
  const onStopSharing = () => {
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_STOP_SHARE_SCREEN_WINDOW,
      {}
    );
  };

  /**
   * 注册窗口关闭事件，重用停止屏幕分享事件处理函数
   */
  useEffect(() => {
    window.addEventListener('beforeunload', onStopSharing, false);
    return () => {
      window.removeEventListener('beforeunload', onStopSharing, false);
    };
  });

  // 全员禁麦
  const muteAllStudent = useCallback(async () => {
    try {
      (window as any).electron.ipcRenderer.send(
        EUserEventNames.ON_UPDATE_ALL_MIC_STATE_FROM_TOP_TOOLBAR,
        {
          isAllStudentMuted: !isAllStudentMuted,
        }
      );
      dispatch(updateAllStudentMuteState(!isAllStudentMuted));
    } catch (error) {
      logger.error(`${logPrefix}muteAllStudent error`, error);
    }
  }, [isAllStudentMuted, dispatch]);

  // 点名
  const callAllStudent = useCallback(async () => {
    try {
      (window as any).electron.ipcRenderer.send(
        EUserEventNames.ON_UPDATE_CALL_ROLL_STATE_FROM_TOP_TOOLBAR,
        {
          isRolled: !isRolled,
        }
      );
      dispatch(updateRollState(!isRolled));
    } catch (error) {
      logger.error(`${logPrefix}callAllStudent error`, error);
    }
  }, [isRolled, dispatch]);

  return (
    <div
      className={`trtc-edu-top-toolbar ${
        platform === 'win32' ? 'platform-win' : ''
      }`}
    >
      {currentUser && (
        <Toolbar
          onChangeSharing={onChangeSharing}
          onStopSharing={onStopSharing}
          isCameraStarted={currentUser.isCameraStarted}
          cameraList={cameraList}
          currentCameraId={currentUser.currentCamera?.deviceId || ''}
          updateCameraState={updateCameraState}
          onOpenCameraSelectPopup={onOpenCameraSelectPopup}
          isMicMuted={currentUser.isMicMuted}
          microphoneList={microphoneList}
          currentMicId={currentUser.currentMic?.deviceId || ''}
          updateMicMuteState={updateMicMuteState}
          speakerList={speakerList}
          currentSpeakerId={currentUser.currentSpeaker?.deviceId || ''}
          onOpenMicSpeakerSelectPopup={onOpenMicSpeakerSelectPopup}
          isAllStudentMuted={isAllStudentMuted}
          onMuteAllStudent={muteAllStudent}
          onCallAllStudent={callAllStudent}
          classStartTime={classStartTime}
          isRolled={isRolled}
        />
      )}
    </div>
  );
}

export default TopToolbarPage;
