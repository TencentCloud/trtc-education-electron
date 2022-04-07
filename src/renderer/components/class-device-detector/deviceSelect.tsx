import React, { useState, useEffect } from 'react';
import logger from 'renderer/utils/logger';
import { TRTCDeviceInfo } from 'trtc-electron-sdk';
import { tuiRoomCore, ETUIRoomEvents } from '../../core/room-core';

const getDeviceList = async (deviceType: any) => {
  let deviceList: TRTCDeviceInfo[] = [];
  switch (deviceType) {
    case 'camera':
      // 获取摄像头列表
      deviceList = await tuiRoomCore.getCameraList();
      break;
    case 'microphone':
      // 获取麦克风
      deviceList = await tuiRoomCore.getMicrophoneList();
      break;
    case 'speaker':
      // 获取说话
      deviceList = await tuiRoomCore.getSpeakerList();
      break;
    default:
      break;
  }
  return deviceList;
};

interface DeviceSelectProps {
  deviceType: any;
  onChange: any;
  choseDevice: any;
}

function DeviceSelect(props: DeviceSelectProps) {
  const { deviceType, onChange, choseDevice } = props;
  const [deviceList, setDeviceList] = useState([]);
  const [activeDevice, setActiveDevice] = useState({});
  const [activeDeviceId, setActiveDeviceId] = useState('');

  useEffect(() => {
    async function getDeviceListData() {
      const list = await getDeviceList(deviceType);
      const deviceIdList = list.map((item: { deviceId: any }) => item.deviceId);
      // @ts-ignore
      setDeviceList(list);
      if (choseDevice && deviceIdList.indexOf(choseDevice.deviceId) >= 0) {
        setActiveDevice(
          list.filter(
            (item: { deviceId: any }) => item.deviceId === choseDevice.deviceId
          )[0]
        );
        setActiveDeviceId(choseDevice.deviceId);
      } else {
        setActiveDevice(list[0]);
        setActiveDeviceId(list[0].deviceId);
      }
    }
    getDeviceListData();
  }, []);

  useEffect(() => {
    if (activeDevice && JSON.stringify(activeDevice) !== '{}') {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onChange && onChange(activeDevice);
    }
  }, [activeDevice]);

  const deviceChange = (options: Record<string, any>) => {
    logger.log('deviceSelect deviceChange', options);
    setDeviceList(options.type);
  };

  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onDeviceChange, deviceChange);

    return () => {
      tuiRoomCore.off(ETUIRoomEvents.onDeviceChange, deviceChange);
    };
  }, [activeDevice]);

  const handleChange = (event: { target: { value: any } }) => {
    const deviceID = event.target.value;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const activeDevice = deviceList.find(
      (item) => (item as any).deviceId === deviceID
    );
    // @ts-ignore
    setActiveDevice(activeDevice);
    setActiveDeviceId(deviceID);
  };

  return (
    <div>
      <select
        className="device-select"
        value={activeDeviceId}
        onChange={handleChange}
      >
        {deviceList.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <option value={(item as any).deviceId} key={index}>
            {(item as any).deviceName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DeviceSelect;
