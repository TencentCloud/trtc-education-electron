import React, { useState, useEffect } from 'react';
import { TRTCDeviceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import logger from '../../../../../utils/logger';
import { EUserEventNames } from '../../../../../../constants';
import Footer from '../../../../../components/class-room-layout/footer';
import { EPopupType } from '../../../../../../types';
import HandUpController from '../../../../../components/toolbar-icon-buttons/hand-up-controller';
import RoasterController from '../../../../../components/toolbar-icon-buttons/roster-controller';
import CameraController from '../../../../../components/toolbar-icon-buttons/camera-controller';
import ShareScreenController from '../../../../../components/toolbar-icon-buttons/share-screen-controller';
import MicrophoneSpeakerController from '../../../../../components/toolbar-icon-buttons/microphone-speaker-controller';
import MuteAllController from '../../../../../components/toolbar-icon-buttons/mute-all-controller';
import RecordController from '../../../../../components/toolbar-icon-buttons/record-controller';
import SettingController from '../../../../../components/toolbar-icon-buttons/setting-controller';
import RollCallController from '../../../../../components/toolbar-icon-buttons/roll-call-controller';
import ExitController from '../../../../../components/toolbar-icon-buttons/exit-controller';
import ConfirmDialog from '../../../../../components/confirm-dialog';
import { tuiRoomCore } from '../../../../../core/room-core';
import './index.scss';

interface TTeacherClassRoomToolBarProps {
  role: string;
  onChangeSharing: () => void;
  isCameraStarted: boolean;
  cameraList: Array<TRTCDeviceInfo>;
  currentCameraID: string | null;
  updateCameraState: (started: boolean) => void;
  onOpenCameraSelectPopup: (anchorBounds: DOMRect) => void;
  isMicMute: boolean;
  microphoneList: Array<TRTCDeviceInfo>;
  currentMicId: string | null;
  updateMicMuteState: (mute: boolean) => void;
  speakerList: Array<TRTCDeviceInfo>;
  currentSpeakerID: string | undefined | null;
  onOpenMicSpeakerSelectPopup: (anchorBounds: DOMRect) => void;
  isAllStudentMuted: boolean;
  onMuteAllStudent: () => void;
  handsUpList: Array<any> | undefined;
  handsUpHandler: (event: React.MouseEvent<HTMLElement> | string) => void;
  onHandsUpPopClose: () => void;
  onCallAllStudent: () => void;
  isRolled: boolean;
}

function TeacherClassRoomToolBar(props: TTeacherClassRoomToolBarProps) {
  const logPrefix = '[TeacherClassRoomToolBar]';
  logger.log(`${logPrefix}.props:`, props);
  const {
    role,
    onChangeSharing,
    isCameraStarted,
    cameraList,
    currentCameraID,
    updateCameraState,
    onOpenCameraSelectPopup,
    isMicMute,
    microphoneList,
    currentMicId,
    updateMicMuteState,
    speakerList,
    currentSpeakerID,
    onOpenMicSpeakerSelectPopup,
    isAllStudentMuted,
    onMuteAllStudent,
    handsUpList,
    handsUpHandler,
    onCallAllStudent,
    onHandsUpPopClose,
    isRolled,
  } = props;

  const [isClosureDialogVisible, setIsClosureDialogVisible] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isWindowClosureConfirm, setIsWindowClosureConfirm] = useState(false);

  // 离开教室前的dialog
  const onCancelWindowClosure = () => {
    setIsClosureDialogVisible(false);
  };
  const onConfirmWindowClosure = async () => {
    setIsWindowClosureConfirm(true);
    setIsClosureDialogVisible(false);

    // 退房失败，不能阻塞窗口关闭
    try {
      await tuiRoomCore.destroyRoom();
    } catch (error: any) {
      logger.error(
        `${logPrefix}.onConfirmWindowClosure exitClassRoom error:`,
        error
      );
    }

    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_TEACHER_EXIT_CLASS_ROOM,
      {}
    );
  };

  const onLeaveRoom = (event: any): string | undefined => {
    if (!isWindowClosureConfirm) {
      // 打开弹窗
      setIsClosureDialogVisible(true);
      // 处理窗口关闭场景
      if (event && event.returnValue !== undefined) {
        event.preventDefault();
        event.returnValue = 'Are you sure to close window?';
        return event.returnValue;
      }
    }
    return undefined;
  };

  // 注册窗口关闭事件监听，重用点击离开教室图标的事件处理函数
  useEffect(() => {
    window.addEventListener('beforeunload', onLeaveRoom, false);
    return () => {
      window.removeEventListener('beforeunload', onLeaveRoom, false);
    };
  });

  const toggleSettingModal = () => {
    setIsSettingModalOpen(!isSettingModalOpen);
  };
  const tipMessage = '确定下课吗？';

  return (
    <div className="trtc-edu-teacher-class-room-tool-bar">
      <Footer>
        <HandUpController
          mode="big"
          name="举手列表"
          handsUpList={handsUpList}
          onClick={handsUpHandler}
          onPopClose={onHandsUpPopClose}
        />
        <RollCallController
          mode="big"
          onCallAllStudent={onCallAllStudent}
          isRolled={isRolled}
        />
        <RoasterController mode="big" />
        <div className="trtc-edu-vertical-line" />
        <CameraController
          mode="big"
          isStarted={isCameraStarted}
          cameraList={cameraList}
          currentID={currentCameraID}
          updateState={updateCameraState}
          popupType={EPopupType.OuterWindow}
          onOpenOuterPopover={onOpenCameraSelectPopup}
        />
        <MicrophoneSpeakerController
          mode="big"
          isMute={isMicMute}
          microphoneList={microphoneList}
          currentMicrophoneID={currentMicId}
          popupType={EPopupType.OuterWindow}
          updateMuteState={updateMicMuteState}
          speakerList={speakerList}
          currentSpeakerID={currentSpeakerID}
          onOpenOuterPopover={onOpenMicSpeakerSelectPopup}
        />
        <ShareScreenController mode="big" onChangeSharing={onChangeSharing} />
        <MuteAllController
          mode="big"
          onMuteAllStudent={onMuteAllStudent}
          isMute={isAllStudentMuted}
        />
        <RecordController mode="big" />
        <SettingController mode="big" onClick={toggleSettingModal} />
        <div className="trtc-edu-vertical-line" />
        <ExitController mode="big" role={role} onExit={onLeaveRoom as any} />
        <ConfirmDialog
          show={isClosureDialogVisible}
          onCancel={onCancelWindowClosure}
          onConfirm={onConfirmWindowClosure}
        >
          {tipMessage}
        </ConfirmDialog>
      </Footer>
    </div>
  );
}

export default TeacherClassRoomToolBar;
