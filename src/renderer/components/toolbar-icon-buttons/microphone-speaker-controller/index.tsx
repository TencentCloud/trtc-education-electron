import React from 'react';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CheckIcon from '@material-ui/icons/Check';
import { TRTCDeviceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import { EPopupType } from '../../../../types';
import BaseToolIconButton from '../base';
import './index.scss';

function MicrophoneList(
  micList: Array<any>,
  currentMicID: string | undefined | null,
  handleUpdateCurrentMic: (id: any) => void
) {
  return (
    <List dense className="microphone-device-list">
      {[...micList].map((mic) => {
        return (
          <ListItem
            className="microphone-device-item"
            onClick={() => handleUpdateCurrentMic(mic.deviceId)}
            key={mic.deviceId}
          >
            <div className="check-wrapper">
              {mic.deviceId === currentMicID ? <CheckIcon /> : null}
            </div>
            <div className="device-name">{mic.deviceName}</div>
          </ListItem>
        );
      })}
    </List>
  );
}

function SpeakerList(
  speakerList: Array<any>,
  currentSpeakerID: string | undefined | null,
  handleUpdateCurrentSpeaker: (id: any) => void
) {
  return (
    <List dense className="speaker-device-list">
      {[...speakerList].map((speaker) => {
        return (
          <ListItem
            className="speaker-device-item"
            onClick={() => handleUpdateCurrentSpeaker(speaker.deviceId)}
            key={speaker.deviceId}
          >
            <div className="check-wrapper">
              {speaker.deviceId === currentSpeakerID ? <CheckIcon /> : null}
            </div>
            <div className="device-name">{speaker.deviceName}</div>
          </ListItem>
        );
      })}
    </List>
  );
}

interface MicrophoneSpeakerControllerProps {
  mode?: string;
  isMute: boolean;
  microphoneList: Array<TRTCDeviceInfo>;
  currentMicrophoneID?: string | undefined | null;
  popupType: EPopupType;
  updateMuteState: (mute: boolean) => void;
  resetCurrentMicrophone?: (id: string) => void | null;
  speakerList: Array<TRTCDeviceInfo>;
  currentSpeakerID: string | undefined | null;
  resetCurrentSpeaker?: (id: string) => void | null;
  onOpenOuterPopover?: (data: any) => void;
}

function MicrophoneSpeakerController(props: MicrophoneSpeakerControllerProps) {
  const {
    mode,
    isMute,
    microphoneList,
    currentMicrophoneID,
    popupType,
    resetCurrentMicrophone,
    updateMuteState,
    speakerList,
    currentSpeakerID,
    resetCurrentSpeaker,
    onOpenOuterPopover,
  } = props;

  const onChangeMicrophone = (newDeviceId: string) => {
    if (currentMicrophoneID === newDeviceId) {
      return;
    }

    if (resetCurrentMicrophone) {
      resetCurrentMicrophone(newDeviceId);
    }
  };

  const onChangeSpeaker = (newDeviceId: string) => {
    if (currentSpeakerID === newDeviceId) {
      return;
    }

    if (resetCurrentSpeaker) {
      resetCurrentSpeaker(newDeviceId);
    }
  };

  const renderIcon = () => {
    return <>{isMute ? <MicOffIcon /> : <MicIcon />}</>;
  };

  const renderPopoverSelect = () => {
    return (
      <div className="device-select-popover">
        <div className="device-list-title">麦克风</div>
        {MicrophoneList(
          microphoneList,
          currentMicrophoneID,
          onChangeMicrophone
        )}
        <div className="device-list-title">扬声器</div>
        {SpeakerList(speakerList, currentSpeakerID, onChangeSpeaker)}
      </div>
    );
  };

  const toggleMuteStatus = () => {
    updateMuteState(!isMute);
  };

  return popupType === EPopupType.InnerWindow ? (
    <BaseToolIconButton
      name="麦克风"
      muted={isMute}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={toggleMuteStatus}
      popupType={EPopupType.InnerWindow}
      renderInnerPopover={renderPopoverSelect}
    />
  ) : (
    <BaseToolIconButton
      name="麦克风"
      muted={isMute}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={toggleMuteStatus}
      popupType={EPopupType.OuterWindow}
      onOpenOuterPopover={onOpenOuterPopover}
    />
  );
}

MicrophoneSpeakerController.defaultProps = {
  currentMicrophoneID: '',
  mode: 'small',
  resetCurrentMicrophone: null,
  resetCurrentSpeaker: null,
  onOpenOuterPopover: null,
};

export default MicrophoneSpeakerController;
