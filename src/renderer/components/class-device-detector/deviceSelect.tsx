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

const getCurrentDevice = async (deviceType: any) => {
  let currentDevice: TRTCDeviceInfo | null = null;
  switch (deviceType) {
    case 'camera':
      currentDevice = await tuiRoomCore.getCurrentCamera();
      break;
    case 'microphone':
      currentDevice = await tuiRoomCore.getCurrentMicrophone();
      break;
    case 'speaker':
      currentDevice = await tuiRoomCore.getCurrentSpeaker();
      break;
    default:
      break;
  }
  return currentDevice;
};

const setCurrentDevice = async (deviceType: any, deviceID: string) => {
  switch (deviceType) {
    case 'camera':
      tuiRoomCore.setCurrentCamera(deviceID);
      break;
    case 'microphone':
      tuiRoomCore.setCurrentMicrophone(deviceID);
      break;
    case 'speaker':
      tuiRoomCore.setCurrentSpeaker(deviceID);
      break;
    default:
      break;
  }
};

interface DeviceSelectProps {
  deviceType: any;
  onChange: any;
  choseDevice: any;
}

function DeviceSelect(props: DeviceSelectProps) {
  const { deviceType, onChange, choseDevice } = props;
  const [deviceList, setDeviceList] = useState<Array<TRTCDeviceInfo>>([]);
  const [activeDevice, setActiveDevice] = useState({});
  const [activeDeviceId, setActiveDeviceId] = useState('');

  useEffect(() => {
    async function getDeviceListData() {
      const list = await getDeviceList(deviceType);
      const currentDevice = await getCurrentDevice(deviceType);
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
      } else if (currentDevice) {
        setActiveDevice(currentDevice);
        setActiveDeviceId(currentDevice.deviceId);
      } else {
        setCurrentDevice(deviceType, list[0].deviceId);
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
  }, [activeDevice, onChange]);

  useEffect(() => {
    const deviceChange = async (options: Record<string, any>) => {
      logger.log('deviceSelect deviceChange', options);
      if (options.type === deviceType) {
        const list = await getDeviceList(deviceType);
        setDeviceList(list);
      }
    };

    tuiRoomCore.on(ETUIRoomEvents.onDeviceChange, deviceChange);

    return () => {
      tuiRoomCore.off(ETUIRoomEvents.onDeviceChange, deviceChange);
    };
  }, [deviceType]);

  const handleChange = (event: { target: { value: any } }) => {
    const deviceID = event.target.value;
    const newActiveDevice = deviceList.find(
      (item: TRTCDeviceInfo) => item.deviceId === deviceID
    );
    // @ts-ignore
    setActiveDevice(newActiveDevice);
    setActiveDeviceId(deviceID);
  };

  return (
    <div>
      <select
        className="device-select"
        value={activeDeviceId}
        onChange={handleChange}
      >
        {deviceList?.map((item: TRTCDeviceInfo) => (
          // eslint-disable-next-line react/no-array-index-key
          <option value={item.deviceId} key={item.deviceId}>
            {(item as any).deviceName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DeviceSelect;
