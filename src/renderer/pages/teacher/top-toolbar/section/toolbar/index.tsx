import a18n from 'a18n';
import React from 'react';
import Button from '@material-ui/core/Button';
import UpdateSharpIcon from '@material-ui/icons/UpdateSharp';
import { TRTCDeviceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import { EPopupType } from '../../../../../../types';
import HandUpController from '../../../../../components/toolbar-icon-buttons/hand-up-controller';
import InstantMessageController from '../../../../../components/toolbar-icon-buttons/instant-message-controller';
import RoasterController from '../../../../../components/toolbar-icon-buttons/roster-controller';
import MicrophoneSpeakerController from '../../../../../components/toolbar-icon-buttons/microphone-speaker-controller';
import CameraController from '../../../../../components/toolbar-icon-buttons/camera-controller';
import ShareScreenController from '../../../../../components/toolbar-icon-buttons/share-screen-controller';
import MuteAllController from '../../../../../components/toolbar-icon-buttons/mute-all-controller';
import RecordController from '../../../../../components/toolbar-icon-buttons/record-controller';
import AnnotationController from '../../../../../components/toolbar-icon-buttons/annotation-controller';
import SettingController from '../../../../../components/toolbar-icon-buttons/setting-controller';
import RollCallController from '../../../../../components/toolbar-icon-buttons/roll-call-controller';
import TitleTime from '../../../../../components/class-room-title-time/index';
import './index.scss';

interface ClassToolProps {
  onChangeSharing: () => void;
  onStopSharing: () => void;
  isCameraStarted: boolean;
  cameraList: Array<TRTCDeviceInfo>;
  currentCameraId: string | null;
  updateCameraState: (started: boolean) => void;
  isMicMuted: boolean;
  microphoneList: Array<TRTCDeviceInfo>;
  currentMicId: string | null;
  updateMicMuteState: (mute: boolean) => void;
  speakerList: Array<TRTCDeviceInfo>;
  currentSpeakerId: string | undefined | null;
  isAllStudentMuted: boolean;
  onMuteAllStudent: () => void;
  onCallAllStudent: () => void;
  classStartTime: number | null;
  isRolled?: boolean;
  onOpenCameraSelectPopup: (anchorBounds: DOMRect) => void;
  onOpenMicSpeakerSelectPopup: (anchorBounds: DOMRect) => void;
}

function ClassTool(props: ClassToolProps) {
  const {
    onChangeSharing,
    onStopSharing,
    isCameraStarted,
    cameraList,
    currentCameraId,
    updateCameraState,
    isMicMuted,
    microphoneList,
    currentMicId,
    updateMicMuteState,
    speakerList,
    currentSpeakerId,
    isAllStudentMuted,
    onMuteAllStudent,
    classStartTime,
    onCallAllStudent,
    isRolled,
    onOpenCameraSelectPopup,
    onOpenMicSpeakerSelectPopup,
  } = props;

  return (
    <div className="trtc-edu-class-tool">
      {/* <HandUpController
        name="举手列表"
      /> */}
      {/* <InstantMessageController /> */}
      <RollCallController
        onCallAllStudent={onCallAllStudent}
        isRolled={isRolled}
      />
      {/* <RoasterController /> */}

      <div className="vertical-line" />

      <CameraController
        isStarted={isCameraStarted}
        cameraList={cameraList}
        currentID={currentCameraId}
        updateState={updateCameraState}
        popupType={EPopupType.OuterWindow}
        onOpenOuterPopover={onOpenCameraSelectPopup}
      />
      <MicrophoneSpeakerController
        isMute={isMicMuted}
        microphoneList={microphoneList}
        currentMicrophoneID={currentMicId}
        popupType={EPopupType.OuterWindow}
        updateMuteState={updateMicMuteState}
        speakerList={speakerList}
        currentSpeakerID={currentSpeakerId}
        onOpenOuterPopover={onOpenMicSpeakerSelectPopup}
      />
      <ShareScreenController onChangeSharing={onChangeSharing} />
      <MuteAllController
        onMuteAllStudent={onMuteAllStudent}
        isMute={isAllStudentMuted}
      />
      {/* <RecordController />
      <AnnotationController /> */}

      {/* <div className="vertical-line" /> */}

      {/* <SettingController /> */}

      <div className="class-info">
        <div className="class-time-span">
          <UpdateSharpIcon />
          <TitleTime classStartTime={classStartTime} />
        </div>
        <div>
          <Button
            className="btn-stop-share"
            variant="contained"
            color="secondary"
            onClick={onStopSharing}
          >
            {a18n('结束分享')}
          </Button>
        </div>
      </div>
    </div>
  );
}

ClassTool.defaultProps = {
  isRolled: false,
};

export default ClassTool;
