import React, { useState, useEffect } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CheckIcon from '@material-ui/icons/Check';
import logger from '../../../utils/logger';
import { EUserEventNames } from '../../../../constants';
import { EEventSource } from '../../../../types';
import './index.scss';

function MicrophoneList(
  micList: Array<any>,
  currentMicId: string | undefined | null,
  handleUpdateCurrentMic: (id: any) => void
) {
  return (
    <List dense className="trtc-edu-microphone-device-list">
      {[...micList].map((mic) => {
        return (
          <ListItem
            className="trtc-edu-microphone-device-item"
            onClick={() => handleUpdateCurrentMic(mic.deviceId)}
            key={mic.deviceId}
          >
            <div className="trtc-edu-check-wrapper">
              {mic.deviceId === currentMicId ? <CheckIcon /> : null}
            </div>
            <div className="trtc-edu-device-name">{mic.deviceName}</div>
          </ListItem>
        );
      })}
    </List>
  );
}

function SpeakerList(
  speakerList: Array<any>,
  currentSpeakerId: string | undefined | null,
  handleUpdateCurrentSpeaker: (id: any) => void
) {
  return (
    <List dense className="trtc-edu-speaker-device-list">
      {[...speakerList].map((speaker) => {
        return (
          <ListItem
            className="trtc-edu-speaker-device-item"
            onClick={() => handleUpdateCurrentSpeaker(speaker.deviceId)}
            key={speaker.deviceId}
          >
            <div className="trtc-edu-check-wrapper">
              {speaker.deviceId === currentSpeakerId ? <CheckIcon /> : null}
            </div>
            <div className="trtc-edu-device-name">{speaker.deviceName}</div>
          </ListItem>
        );
      })}
    </List>
  );
}

function MicrophoneSpeakerSelector(props: Record<string, any>) {
  const logPrefix = '[MicrophoneSpeakerSelector]';
  const [currentMicrophoneID, setCurrentMicrophoneID] = useState<string>('');
  const [microphoneList, setMicrophoneList] = useState<
    Array<Record<string, any>>
  >([]);
  const [currentSpeakerID, setCurrentSpeakerID] = useState<string>('');
  const [speakerList, setSpeakerList] = useState<Array<Record<string, any>>>(
    []
  );
  const [eventSource, setEventSource] = useState<string>('');

  const onChangeMicrophone = (newDeviceID: string) => {
    logger.log(`${logPrefix}onChangeMicrophone newDeviceID: ${newDeviceID}`);

    const selected =
      microphoneList.filter((item) => item.deviceId === newDeviceID)[0] || null;
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_CURRENT_MICROPHONE,
      {
        currentMicrophone: selected,
      }
    );
  };

  const onChangeSpeaker = (newDeviceID: string) => {
    logger.log(`${logPrefix}onChangeSpeaker newDeviceID: ${newDeviceID}`);

    const selected =
      speakerList.filter((item) => item.deviceId === newDeviceID)[0] || null;
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_CURRENT_SPEAKER,
      {
        currentSpeaker: selected,
      }
    );
  };

  const handleInitData = (event: any, data: Record<string, any>) => {
    logger.debug(`${logPrefix}handleInitData data:`, data);
    if (data.currentMicrophone && data.microphoneList) {
      const {
        currentMicrophone,
        microphoneList: inputMicrophoneList,
        currentSpeaker,
        speakerList: inputSpeakerList,
        eventSource: inputEventSource,
      } = data;
      setCurrentMicrophoneID(currentMicrophone.deviceId || '');
      setMicrophoneList(inputMicrophoneList);
      setCurrentSpeakerID(currentSpeaker.deviceId || '');
      setSpeakerList(inputSpeakerList);
      setEventSource(inputEventSource);
    }
  };

  // 监听初始化数据事件
  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_INIT_DATA,
      handleInitData
    );

    return () => {
      (window as any).electron.ipcRenderer.removeListener(
        EUserEventNames.ON_INIT_DATA,
        handleInitData
      );
    };
  });

  const renderPopupContent = () => {
    return (
      <div className="trtc-edu-device-select-popover">
        <div className="trtc-edu-device-list-title">麦克风</div>
        {MicrophoneList(
          microphoneList,
          currentMicrophoneID,
          onChangeMicrophone
        )}
        <div className="trtc-edu-device-list-title">扬声器</div>
        {SpeakerList(speakerList, currentSpeakerID, onChangeSpeaker)}
      </div>
    );
  };

  return (
    <div
      className={`trtc-edu-mic-speaker-selector ${
        eventSource === EEventSource.TopToolbarWindow
          ? 'trtc-edu-top-to-bottom'
          : 'trtc-edu-bottom-to-top'
      }`}
    >
      {renderPopupContent()}
    </div>
  );
}

export default MicrophoneSpeakerSelector;
