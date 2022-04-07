import a18n from 'a18n';
import React, { useState, useEffect, useRef } from 'react';
import './index.scss';
import logger from 'renderer/utils/logger';
import DeviceSelect from './deviceSelect';
import Button from './base-components/index';

import { ETUIRoomEvents, tuiRoomCore } from '../../core/room-core';

const currentDetector = 'microphone';

interface MicrophoneDetectorProps {
  activeDetector: any;
  handleCompleted: any;
}
function MicrophoneDetector(props: MicrophoneDetectorProps) {
  const { activeDetector, handleCompleted } = props;
  const [microphoneID, setMicrophoneID] = useState(
    tuiRoomCore.getCurrentMicrophone()?.deviceId
  );
  const [microphoneLabel, setMicrophoneLabel] = useState('');
  const [volumeNum, setVolumeNum] = useState(0);
  const [choseDevice, setChoseDevice] = useState(null);
  const ref = useRef(null);

  const initStream = async (microphone: string) => {
    logger.log('microphoneID', microphone);
    tuiRoomCore.startMicrophoneTest();
  };

  const micVolumeChange = (event: Record<string, any>) => {
    setVolumeNum(event.data);
  };

  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onTestMicVolume, micVolumeChange);

    if (activeDetector === currentDetector && microphoneID) {
      initStream(microphoneID);
    }
    return () => {
      if (activeDetector === currentDetector) {
        setVolumeNum(0);
        tuiRoomCore.stopMicrophoneTest();
      }
      tuiRoomCore.off(ETUIRoomEvents.onTestMicVolume, micVolumeChange);
    };
  }, [activeDetector]);

  const handleMicrophoneChange = async (microphoneDevice: any) => {
    setChoseDevice(microphoneDevice);
    const { deviceId, deviceName } = microphoneDevice;
    // 切换当前扬声器
    tuiRoomCore.setCurrentMicrophone(deviceId);
    initStream(deviceId);
    setMicrophoneID(deviceId);
    setMicrophoneLabel(deviceName);
  };

  return (
    activeDetector === currentDetector && (
      <div className="testing-body">
        <div className="device-list">
          <span className="device-list-title">{a18n('麦克风选择')}</span>
          <DeviceSelect
            deviceType="microphone"
            choseDevice={choseDevice}
            onChange={handleMicrophoneChange}
          />
        </div>
        <div className="mic-testing-container">
          <div className="mic-testing-info">
            {a18n('对着麦克风说"哈喽"试试～')}
          </div>
          <div className="mic-bar-container">
            {new Array(20).fill('').map((item, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`mic-bar ${volumeNum / 5 > index && 'active'}`}
              />
            ))}
          </div>
          <div id="audio-container" ref={ref} />
        </div>
        <div className="testing-info-container">
          <div className="testing-info">
            {a18n('是否可以看到音量图标跳动？')}
          </div>
          <div className="button-list">
            <Button
              type="outlined"
              onClick={() => handleCompleted('error', microphoneLabel)}
              className=""
            >
              {a18n('看不到')}
            </Button>
            <Button
              type="contained"
              onClick={() => handleCompleted('success', microphoneLabel)}
              className=""
            >
              {a18n('看的到')}
            </Button>
          </div>
        </div>
      </div>
    )
  );
}

export default MicrophoneDetector;
