import a18n from 'a18n';
import React, { useState, useEffect } from 'react';
import { tuiRoomCore } from '../../core/room-core';
import './index.scss';
import Button from './base-components/index';
import {
  isOnline,
  handleGetUserMediaError,
  CameraIcon,
  MicIcon,
  SpeakerIcon,
  NetworkIcon,
  ErrorIcon,
} from './utils';

const deviceFailAttention =
  a18n('1. 若浏览器弹出提示，请选择“允许”<br>') +
  +a18n('2. 若杀毒软件弹出提示，请选择“允许”<br>') +
  a18n('3. 检查系统设置，允许浏览器访问摄像头及麦克风<br>') +
  a18n('4. 检查浏览器设置，允许网页访问摄像头及麦克风<br>') +
  a18n('5. 检查摄像头/麦克风是否正确连接并开启<br>') +
  +a18n('6. 尝试重新连接摄像头/麦克风<br>') +
  a18n('7. 尝试重启设备后重新检测');
const networkFailAttention =
  a18n('1. 请检查设备是否联网<br>') +
  a18n('2. 请刷新网页后再次检测<br>') +
  +a18n('3. 请尝试更换网络后再次检测');

interface DeviceConnectProps {
  stepNameList: any;
  startDeviceDetect: any;
}
interface DeviceStateType {
  hasCameraDevice: any;
  hasMicrophoneDevice: any;
  hasSpeakerDevice: any;
  hasCameraConnect: boolean;
  hasMicrophoneConnect: boolean;
  hasSpeakerConnect: boolean;
  hasNetworkConnect: boolean;
}
interface ConnectResultType {
  success: boolean;
  info: string;
  remind?: string;
}
function DeviceConnect(props: DeviceConnectProps) {
  const { stepNameList, startDeviceDetect } = props;
  const [progress, setProgress] = useState(0);
  const [deviceState, setDeviceState] = useState<DeviceStateType | undefined>();
  const [connectResult, setConnectResult] =
    useState<ConnectResultType | null>();
  const [showConnectResult, setShowConnectResult] = useState(false);
  const [showRemind, setShowRemind] = useState(false);
  const hasCameraDetect = stepNameList.indexOf('camera') >= 0;
  const hasMicrophoneDetect = stepNameList.indexOf('microphone') >= 0;
  const hasSpeakerDetect = stepNameList.indexOf('speaker') >= 0;
  const hasNetworkDetect = stepNameList.indexOf('network') >= 0;

  const handleReset = () => {
    setProgress(0);
    setConnectResult(null);
    setShowConnectResult(false);
  };

  const getDeviceConnectInfo = (deviceStateInfo: any): ConnectResultType => {
    let connectInfo = a18n('连接出错，请重试');
    if (
      deviceStateInfo.hasCameraConnect &&
      deviceStateInfo.hasMicrophoneConnect &&
      deviceStateInfo.hasSpeakerConnect &&
      deviceStateInfo.hasNetworkConnect
    ) {
      if (hasNetworkDetect) {
        connectInfo = a18n('设备及网络连接成功，请开始设备检测');
      } else {
        connectInfo = a18n('设备连接成功，请开始设备检测');
      }
      return {
        info: connectInfo,
        success: true,
      };
    }
    // 第一步：未检测到摄像头/麦克风/扬声器设备的提示
    if (
      !(
        deviceStateInfo.hasCameraDevice &&
        deviceStateInfo.hasMicrophoneDevice &&
        deviceStateInfo.hasSpeakerDevice
      )
    ) {
      connectInfo = a18n`未检测到${
        deviceStateInfo.hasCameraDevice ? '' : a18n('【摄像头】')
      }${deviceStateInfo.hasMicrophoneDevice ? '' : a18n('【麦克风】')}${
        deviceStateInfo.hasSpeakerDevice ? '' : a18n('【扬声器】')
      }设备，请检查设备连接`;
      return {
        info: connectInfo,
        success: false,
      };
    }
    // 第二步：未拿到摄像头/麦克风权限的提示
    if (
      !(
        deviceStateInfo.hasCameraConnect && deviceStateInfo.hasMicrophoneConnect
      )
    ) {
      connectInfo = deviceStateInfo.hasNetworkConnect
        ? a18n('请允许访问摄像头/麦克风设备')
        : a18n('请允许访问摄像头/麦克风设备，并检查网络连接');
      return {
        info: connectInfo,
        success: false,
        remind: deviceFailAttention,
      };
    }
    // 第三步：检测未连接网络的提示
    if (!deviceStateInfo.hasNetworkConnect) {
      connectInfo = a18n('网络连接失败，请检查网络连接');
      return {
        info: connectInfo,
        success: false,
        remind: networkFailAttention,
      };
    }
    return {
      info: connectInfo,
      success: false,
    };
  };

  const getDeviceConnectResult = async () => {
    let cameraList = [];
    let micList = [];
    let speakerList = [];
    try {
      cameraList = await tuiRoomCore.getCameraList();
      micList = await tuiRoomCore.getMicrophoneList();
      speakerList = await tuiRoomCore.getSpeakerList();
    } catch (error) {
      console.log('rtc-device-detector getDeviceList error', error);
    }
    const hasCameraDevice = cameraList.length > 0;
    const hasMicrophoneDevice = micList.length > 0;
    const hasSpeakerDevice = speakerList.length > 0;
    const hasNetworkConnect = hasNetworkDetect ? await isOnline() : true;
    let deviceStateObj = {
      hasCameraDevice,
      hasMicrophoneDevice,
      hasSpeakerDevice,
      hasNetworkConnect: true,
      hasCameraConnect: false,
      hasMicrophoneConnect: false,
      hasSpeakerConnect: false,
    };
    setDeviceState(deviceStateObj);
    setConnectResult(getDeviceConnectInfo(deviceStateObj));

    // 摄像头设备是否连接
    if (hasCameraDevice) {
      const currentCameraDevice = tuiRoomCore.getCurrentCamera();
      if (currentCameraDevice && currentCameraDevice.deviceId) {
        deviceStateObj = {
          ...deviceStateObj,
          hasCameraConnect: true,
        };
        setDeviceState(deviceStateObj);
        // 显示设备连接信息
        setConnectResult(getDeviceConnectInfo(deviceStateObj));
      }
    }

    // 麦克风设备是否连接
    if (hasMicrophoneDevice) {
      const currentMicrophoneDevice = tuiRoomCore.getCurrentMicrophone();
      if (currentMicrophoneDevice && currentMicrophoneDevice.deviceId) {
        deviceStateObj = {
          ...deviceStateObj,
          hasMicrophoneConnect: true,
        };
        setDeviceState(deviceStateObj);
        // 显示设备连接信息
        setConnectResult(getDeviceConnectInfo(deviceStateObj));
      }
    }

    // 扬声器设备是否连接
    if (hasSpeakerDevice) {
      const currentSpeakerDevice = tuiRoomCore.getCurrentSpeaker();
      if (currentSpeakerDevice && currentSpeakerDevice.deviceId) {
        deviceStateObj = {
          ...deviceStateObj,
          hasSpeakerConnect: true,
        };
        setDeviceState(deviceStateObj);
        // 显示设备连接信息
        setConnectResult(getDeviceConnectInfo(deviceStateObj));
      }
    }
  };

  useEffect(() => {
    getDeviceConnectResult();
    return () => handleReset();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showConnectResult === false) {
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(interval);
            setShowConnectResult(true);
            return 100;
          }
          return oldProgress + 10;
        });
      }, 200);
    }
    return () => {
      clearInterval(interval);
    };
  }, [showConnectResult]);

  return (
    <div className="device-connect">
      <div className="testing-title">{a18n('设备连接')}</div>
      <div className="testing-prepare-info">
        {a18n`设备检测前请确认设备连接了${
          hasCameraDetect ? a18n('摄像头') : ''
        }${hasMicrophoneDetect ? a18n('、麦克风') : ''}${
          hasSpeakerDetect ? a18n('、扬声器') : ''
        }${hasNetworkDetect ? a18n('和网络') : ''}`}
      </div>
      <div className="device-display">
        {stepNameList.map((stepName: any, index: any) => {
          if (stepName === 'camera') {
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`${
                  showConnectResult &&
                  ((deviceState as any).hasCameraConnect
                    ? 'connect-success'
                    : 'connect-fail')
                }`}
              >
                <span className="device">{CameraIcon}</span>
              </div>
            );
          }
          if (stepName === 'microphone') {
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`${
                  showConnectResult &&
                  ((deviceState as any).hasMicrophoneConnect
                    ? 'connect-success'
                    : 'connect-fail')
                }`}
              >
                <span className="device">{MicIcon}</span>
              </div>
            );
          }
          if (stepName === 'speaker') {
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`${
                  showConnectResult &&
                  ((deviceState as any).hasSpeakerConnect
                    ? 'connect-success'
                    : 'connect-fail')
                }`}
              >
                <span className="device">{SpeakerIcon}</span>
              </div>
            );
          }
          if (stepName === 'network') {
            return (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={`${
                  showConnectResult &&
                  ((deviceState as any).hasNetworkConnect
                    ? 'connect-success'
                    : 'connect-fail')
                }`}
              >
                <span className="device">{NetworkIcon}</span>
              </div>
            );
          }
          return null;
        })}
        {!showConnectResult && (
          <div className="outer-progress">
            <div
              className="inner-progress"
              style={{ transform: `translateX(${progress - 100}%)` }}
            />
          </div>
        )}
      </div>
      {!showConnectResult && (
        <div className="text gray-text">{a18n('设备正在连接中，请稍后')}</div>
      )}
      {showConnectResult && (
        <div
          className={`text ${
            (connectResult as any).success ? 'green-text' : 'red-text'
          }`}
        >
          <span>{(connectResult as any).info}</span>
          {(connectResult as any).remind && (
            <div
              className="error-connect"
              onTouchStart={() => setShowRemind(true)}
              onMouseEnter={() => setShowRemind(true)}
              onTouchEnd={() => setShowRemind(false)}
              onMouseLeave={() => setShowRemind(false)}
            >
              <span className="error-icon">{ErrorIcon}</span>
              {showRemind && (
                <div
                  className="connect-attention-info"
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: (connectResult as any).remind,
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
      <div className="button-container">
        {!showConnectResult && (
          // @ts-ignore
          <Button type="disabled">{a18n('开始检测')}</Button>
        )}
        {showConnectResult &&
          !(
            (deviceState as any).hasCameraConnect &&
            (deviceState as any).hasMicrophoneConnect &&
            (deviceState as any).hasSpeakerConnect &&
            (deviceState as any).hasNetworkConnect
          ) && (
            <Button type="contained" onClick={handleReset} className="">
              {a18n('重新连接')}
            </Button>
          )}
        {showConnectResult &&
          (deviceState as any).hasCameraConnect &&
          (deviceState as any).hasMicrophoneConnect &&
          (deviceState as any).hasSpeakerConnect &&
          (deviceState as any).hasNetworkConnect && (
            <Button type="contained" onClick={startDeviceDetect} className="">
              {a18n('开始检测')}
            </Button>
          )}
      </div>
    </div>
  );
}
export default DeviceConnect;
