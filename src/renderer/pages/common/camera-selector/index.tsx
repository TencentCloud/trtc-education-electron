import React, { useState, useEffect } from 'react';
import CheckIcon from '@material-ui/icons/Check';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import logger from '../../../utils/logger';
import { EUserEventNames } from '../../../../constants';
import { EEventSource } from '../../../../types';
import './index.scss';

function CameraList(
  camList: Array<any>,
  currentCamId: string | undefined | null,
  handleUpdateCurrentCam: (id: any) => void
) {
  return (
    <List dense className="trtc-edu-camera-device-list">
      {[...camList].map((cam) => {
        return (
          <ListItem
            className="trtc-edu-camera-device-item"
            key={cam.deviceId}
            onClick={() => handleUpdateCurrentCam(cam.deviceId)}
          >
            <div className="trtc-edu-check-wrapper">
              {cam.deviceId === currentCamId ? <CheckIcon /> : null}
            </div>
            <div className="trtc-edu-device-name">{cam.deviceName}</div>
          </ListItem>
        );
      })}
    </List>
  );
}

function CameraSelector(props: Record<string, any>) {
  const logPrefix = '[CameraSelector]';
  const [currentCameraID, setCurrentCameraID] =
    useState<string | undefined | null>(null);
  const [cameraList, setCameraList] = useState<Array<Record<string, any>>>([]);
  const [eventSource, setEventSource] = useState<string>('');

  const onChangeCamera = (newDeviceID: string) => {
    logger.log(`${logPrefix}onChangeCamera newDeviceID: ${newDeviceID}`);

    const selected =
      cameraList.filter((item) => item.deviceId === newDeviceID)[0] || null;
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_CURRENT_CAMERA,
      {
        currentCamera: selected,
      }
    );
  };

  const handleInitData = (event: any, data: Record<string, any>) => {
    logger.debug(`${logPrefix}handleInitData data:`, data);
    if (data.currentCamera && data.cameraList) {
      const {
        currentCamera,
        cameraList: inputCameraList,
        eventSource: inputEventSource,
      } = data;
      setCurrentCameraID(currentCamera.deviceId || '');
      setCameraList(inputCameraList);
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
        <div className="trtc-edu-device-list-title">摄像头</div>
        {CameraList(cameraList, currentCameraID, onChangeCamera)}
      </div>
    );
  };

  return (
    <div
      className={`trtc-edu-camera-selector ${
        eventSource === EEventSource.TopToolbarWindow
          ? 'trtc-edu-top-to-bottom'
          : 'trtc-edu-bottom-to-top'
      }`}
    >
      {renderPopupContent()}
    </div>
  );
}

export default CameraSelector;
