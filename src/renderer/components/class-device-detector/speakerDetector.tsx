import a18n from 'a18n';
import React, { useState, useEffect } from 'react';
import { tuiRoomCore, ETUIRoomEvents } from 'renderer/core/room-core';
import Switch from '@material-ui/core/Switch';
import DeviceSelect from './deviceSelect';
import Button from './base-components/index';
import logger from '../../utils/logger';

const currentDetector = 'speaker';

interface SpeakerDetectorProps {
  audioUrl: any;
  activeDetector: any;
  handleCompleted: any;
}

function SpeakerDetector(props: SpeakerDetectorProps) {
  const { audioUrl, activeDetector, handleCompleted } = props;
  const [speakerLabel, setSpeakerLabel] = useState('');
  const [choseDevice, setChoseDevice] = useState(null);
  const [speakOn, setSpeakOn] = useState(false);
  const [speakerVolum, setSpeakerVolum] = useState(0);

  const onTestSpeaker = (event: Record<string, any>) => {
    // const speakProgress = speakerVolum + event.data;
    logger.warn('speakerDetector onTestSpeaker event.data', event.data);
    setSpeakerVolum(event.data);
  };

  const toggleSpeakerTest = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpeakOn(event.target.checked);
    if (event.target.checked) {
      const testFilePath =
        'https://web.sdk.qcloud.com/trtc/electron/download/resources/media/TestSpeaker.mp3';
      logger.log(`startSpeakerTest, startSpeakerDeviceTest('${testFilePath}')`);
      tuiRoomCore.startSpeakerTest(testFilePath);
    } else {
      setSpeakerVolum(0);
      tuiRoomCore.stopSpeakerTest();
    }
  };

  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onTestSpeakerVolume, onTestSpeaker);
    return () => {
      if (activeDetector === currentDetector) {
        setSpeakerVolum(0);
      }
      tuiRoomCore.off(ETUIRoomEvents.onTestSpeakerVolume, onTestSpeaker);
    };
  }, [activeDetector]);

  const handleSpeakerChange = async (speakerDevice: any) => {
    setChoseDevice(speakerDevice);
    const { deviceId, deviceName } = speakerDevice;
    tuiRoomCore.setCurrentSpeaker(deviceId);
    setSpeakerLabel(deviceName);
  };

  return (
    activeDetector === currentDetector && (
      <div className="testing-body">
        <div className="device-list">
          <span className="device-list-title">{a18n('扬声器选择')}</span>
          <DeviceSelect
            deviceType="speaker"
            choseDevice={choseDevice}
            onChange={handleSpeakerChange}
          />
        </div>
        <div className="audio-player-container">
          <div className="audio-player-info">
            {a18n('请调高设备音量，点击播放下面的音频试试～')}
          </div>
          <div>
            <span>{a18n('播放音频')}</span>
            <Switch
              checked={speakOn}
              onChange={toggleSpeakerTest}
              color="primary"
            />
          </div>
          <div className="mic-bar-container">
            {new Array(20).fill('').map((item, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`mic-bar ${speakerVolum / 5 > index && 'active'}`}
              />
            ))}
          </div>
        </div>
        <div className="testing-info-container">
          <div className="testing-info">{a18n('是否可以听到声音？')}</div>
          <div className="button-list">
            <Button
              type="outlined"
              onClick={() => handleCompleted('error', speakerLabel)}
              className=""
            >
              {a18n('听不到')}
            </Button>
            <Button
              type="contained"
              onClick={() => handleCompleted('success', speakerLabel)}
              className=""
            >
              {a18n('听的到')}
            </Button>
          </div>
        </div>
      </div>
    )
  );
}

export default SpeakerDetector;
