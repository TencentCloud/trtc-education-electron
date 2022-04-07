import a18n from 'a18n';
import React, { useState, useEffect, useRef } from 'react';
import './index.scss';
import DeviceSelect from './deviceSelect';
import { tuiRoomCore } from '../../core/room-core';
import Button from './base-components/index';

const currentDetector = 'camera';
interface CameraDetectorProps {
  activeDetector: any;
  handleCompleted: any;
}
function CameraDetector(props: CameraDetectorProps) {
  const { activeDetector, handleCompleted } = props;
  const [cameraLabel, setCameraLabel] = useState('');
  const [cameraID, setCameraID] = useState(
    tuiRoomCore.getCurrentCamera()?.deviceId
  );
  const [choseDevice, setChoseDevice] = useState(null);
  const ref = useRef(null);

  const initStream = async () => {
    if (ref.current) {
      tuiRoomCore.startCameraDeviceTest(ref.current);
    }
  };

  useEffect(() => {
    if (activeDetector === currentDetector && cameraID) {
      initStream();
    }
    return () => {
      if (activeDetector === currentDetector) {
        tuiRoomCore.stopCameraDeviceTest();
      }
    };
  }, [activeDetector]);

  const handleCameraChange = async (cameraDevice: any) => {
    setChoseDevice(cameraDevice);
    const { deviceId, deviceName } = cameraDevice;
    tuiRoomCore.setCurrentCamera(deviceId);
    setCameraID(deviceId);
    setCameraLabel(deviceName);
  };

  const handleError = () => {
    handleCompleted('error', cameraLabel);
  };

  const handleSuccess = () => {
    handleCompleted('success', cameraLabel);
  };

  return (
    activeDetector === currentDetector && (
      <div className="testing-body">
        <div className="device-list">
          <span className="device-list-title">{a18n('摄像头选择')}</span>
          <DeviceSelect
            deviceType="camera"
            choseDevice={choseDevice}
            onChange={handleCameraChange}
          />
        </div>
        <div id="camera-video" className="camera-video" ref={ref} />
        <div className="testing-info-container">
          <div className="testing-info">{a18n('是否可以清楚的看到自己？')}</div>
          <div className="button-list">
            <Button type="outlined" onClick={handleError} className="">
              {a18n('看不到')}
            </Button>
            <Button type="contained" onClick={handleSuccess} className="">
              {a18n('看的到')}
            </Button>
          </div>
        </div>
      </div>
    )
  );
}

export default CameraDetector;
