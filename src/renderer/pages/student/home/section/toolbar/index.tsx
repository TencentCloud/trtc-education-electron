import a18n from 'a18n';
import React, { useState, useEffect } from 'react';
import { TRTCDeviceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import logger from '../../../../../utils/logger';
import { EUserEventNames } from '../../../../../../constants';
import Footer from '../../../../../components/class-room-layout/footer';
import { EPopupType } from '../../../../../../types';
import HandUpController from '../../../../../components/toolbar-icon-buttons/hand-up-controller';
import CameraController from '../../../../../components/toolbar-icon-buttons/camera-controller';
import MicrophoneSpeakerController from '../../../../../components/toolbar-icon-buttons/microphone-speaker-controller';
import SettingController from '../../../../../components/toolbar-icon-buttons/setting-controller';
import ExitController from '../../../../../components/toolbar-icon-buttons/exit-controller';
import ConfirmDialog from '../../../../../components/confirm-dialog';
import { tuiRoomCore, ETUIRoomEvents } from '../../../../../core/room-core';

interface TStudentClassRoomToolBarProps {
  role: string;
  isCameraStarted: boolean;
  cameraList: Array<TRTCDeviceInfo>;
  currentCameraID: string | null;
  resetCurrentCamera: (id: string) => void;
  updateCameraState: (started: boolean) => void;
  isMicMute: boolean;
  microphoneList: Array<TRTCDeviceInfo>;
  currentMicrophoneID: string | null;
  resetCurrentMicrophone: (id: string) => void;
  updateMicMuteState: (mute: boolean) => void;
  speakerList: Array<TRTCDeviceInfo>;
  currentSpeakerID: string | undefined | null;
  resetCurrentSpeaker: (id: string) => void;
  handsUpHandler: (event: React.MouseEvent<HTMLElement> | string) => void;
}

function StudentClassRoomToolBar(props: TStudentClassRoomToolBarProps) {
  const logPrefix = '[StudentClassRoomToolBar]';
  logger.log(`${logPrefix}.props:`, props);
  const {
    role,
    isCameraStarted,
    cameraList,
    currentCameraID,
    resetCurrentCamera,
    updateCameraState,
    isMicMute,
    microphoneList,
    currentMicrophoneID,
    resetCurrentMicrophone,
    updateMicMuteState,
    speakerList,
    currentSpeakerID,
    resetCurrentSpeaker,
    handsUpHandler,
  } = props;
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isClosureDialogVisible, setIsClosureDialogVisible] = useState(false);
  const [isWindowClosureConfirm, setIsWindowClosureConfirm] = useState(false);
  const [tipMessage, setTipMessage] = useState('');
  const [isClassRoomDisMissed, setIsClassRoomDisMissed] = useState(false);
  const [isCancelExit, setIsCancelExit] = useState(false);

  const toggleSettingModal = () => {
    setIsSettingModalOpen(!isSettingModalOpen);
  };

  // 离开教室前的dialog
  const onCancelWindowClosure = () => {
    setIsClosureDialogVisible(false);
  };
  const onConfirmWindowClosure = async () => {
    setIsWindowClosureConfirm(true);
    setIsClosureDialogVisible(false);

    // 退房失败，不能阻塞窗口关闭
    try {
      await tuiRoomCore.exitRoom();
    } catch (error: any) {
      logger.error(
        `${logPrefix}onConfirmWindowClosure exitClassRoom error:`,
        error
      );
    }

    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_STUDENT_EXIT_CLASS_ROOM,
      {}
    );
  };

  const onLeaveRoom = (event: any): string | undefined => {
    if (!isWindowClosureConfirm && !isClassRoomDisMissed) {
      // 打开弹窗
      setIsClosureDialogVisible(true);
      setIsCancelExit(true);
      setTipMessage(a18n('确定离开教室吗？'));
      // 处理窗口关闭场景
      if (event && event.returnValue !== undefined) {
        event.preventDefault();
        event.returnValue = 'Are you sure to close window?';
        return event.returnValue;
      }
    }
    return undefined;
  };

  // 注册窗口关闭事件监听，重用点击离开教室的事件处理函数
  useEffect(() => {
    window.addEventListener('beforeunload', onLeaveRoom, false);
    return () => {
      window.removeEventListener('beforeunload', onLeaveRoom, false);
    };
  });

  const onRoomDestroyed = () => {
    logger.log(`${logPrefix}onRoomDestroyed`);
    setTipMessage(a18n('老师已解散课堂!'));
    setIsClassRoomDisMissed(true);
    setIsCancelExit(false);
    setIsClosureDialogVisible(true);
  };

  // 注册老师下课事件监听：即老师端销毁房间、解散群组
  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onRoomDestroyed, onRoomDestroyed, {});

    return () => {
      tuiRoomCore.off(ETUIRoomEvents.onRoomDestroyed, onRoomDestroyed);
    };
  });

  return (
    <div className="trtc-edu-teacher-class-room-tool-bar">
      <Footer>
        <HandUpController
          mode="big"
          name={a18n('举手')}
          onClick={handsUpHandler}
        />
        <CameraController
          mode="big"
          isStarted={isCameraStarted}
          cameraList={cameraList}
          currentID={currentCameraID}
          updateState={updateCameraState}
          popupType={EPopupType.InnerWindow}
          resetCurrentCamera={resetCurrentCamera}
        />
        <MicrophoneSpeakerController
          mode="big"
          isMute={isMicMute}
          microphoneList={microphoneList}
          currentMicrophoneID={currentMicrophoneID}
          popupType={EPopupType.InnerWindow}
          resetCurrentMicrophone={resetCurrentMicrophone}
          updateMuteState={updateMicMuteState}
          speakerList={speakerList}
          currentSpeakerID={currentSpeakerID}
          resetCurrentSpeaker={resetCurrentSpeaker}
        />
        <SettingController mode="big" onClick={toggleSettingModal} />
        <ExitController mode="big" role={role} onExit={onLeaveRoom as any} />
        <ConfirmDialog
          show={isClosureDialogVisible}
          onCancel={isCancelExit ? onCancelWindowClosure : undefined}
          onConfirm={onConfirmWindowClosure}
        >
          {tipMessage}
        </ConfirmDialog>
      </Footer>
    </div>
  );
}

export default StudentClassRoomToolBar;
