import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TRTCDeviceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import { initDeviceStore } from '../../store/device/deviceSlice';
import { tuiRoomCore } from '../../core/room-core';
import logger from '../../utils/logger';
import { updateCurrentDevice } from '../../store/user/userSlice';
import { EUserEventNames } from '../../../constants';

function useDevice() {
  const logPrefix = '[useDevice]';
  const cameraList = useSelector((state: any) => state.device.cameraList);
  const microphoneList = useSelector(
    (state: any) => state.device.microphoneList
  );
  const speakerList = useSelector((state: any) => state.device.speakerList);
  const dispatch = useDispatch();

  const setCurrentCamera = useCallback(
    (cameraDevice: TRTCDeviceInfo | null) => {
      if (cameraDevice) {
        dispatch(
          updateCurrentDevice({
            currentCamera: cameraDevice,
          })
        );
        (window as any).electron.ipcRenderer.send(
          EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
          {
            currentCamera: cameraDevice,
          }
        );
      }
    },
    [dispatch]
  );

  const setCurrentMicrophone = useCallback(
    (microphoneDevice: TRTCDeviceInfo | null) => {
      if (microphoneDevice) {
        dispatch(
          updateCurrentDevice({
            currentMic: microphoneDevice,
          })
        );
        (window as any).electron.ipcRenderer.send(
          EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
          {
            currentMic: microphoneDevice,
          }
        );
      }
    },
    [dispatch]
  );

  const setCurrentSpeaker = useCallback(
    (speakerDevice: TRTCDeviceInfo | null) => {
      if (speakerDevice) {
        dispatch(
          updateCurrentDevice({
            currentSpeaker: speakerDevice,
          })
        );
        (window as any).electron.ipcRenderer.send(
          EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
          {
            currentSpeaker: speakerDevice,
          }
        );
      }
    },
    [dispatch]
  );

  // 设备数据初始化，只需要执行一次，数据存储在 store 中
  useEffect(() => {
    if (tuiRoomCore) {
      const cameras = tuiRoomCore.getCameraList();
      const microphones = tuiRoomCore.getMicrophoneList();
      const speakers = tuiRoomCore.getSpeakerList();
      dispatch(
        initDeviceStore({
          cameraList: cameras,
          microphoneList: microphones,
          speakerList: speakers,
        })
      );
      (window as any).electron.ipcRenderer.send(
        EUserEventNames.ON_INIT_DEVICE,
        {
          cameraList: cameras,
          microphoneList: microphones,
          speakerList: speakers,
        }
      );

      const currentCamera = tuiRoomCore.getCurrentCamera();
      setCurrentCamera(currentCamera);
      const currentMicrophone = tuiRoomCore.getCurrentMicrophone();
      setCurrentMicrophone(currentMicrophone);
      const currentSpeaker = tuiRoomCore.getCurrentSpeaker();
      setCurrentSpeaker(currentSpeaker);
    }
  }, []);

  const changeCurrentMicrophone = useCallback(
    (newDeviceId: string) => {
      tuiRoomCore.setCurrentMicrophone(newDeviceId);
      const selected =
        microphoneList.filter(
          (item: TRTCDeviceInfo) => item.deviceId === newDeviceId
        )[0] || null;
      if (selected) {
        setCurrentMicrophone(selected);
      }
    },
    [microphoneList, setCurrentMicrophone]
  );

  const changeCurrentCamera = useCallback(
    (newDeviceId: string) => {
      tuiRoomCore.setCurrentCamera(newDeviceId);
      const selected =
        cameraList.filter(
          (item: TRTCDeviceInfo) => item.deviceId === newDeviceId
        )[0] || null;
      if (selected) {
        setCurrentCamera(selected);
      }
    },
    [cameraList, setCurrentCamera]
  );

  const changeCurrentSpeaker = useCallback(
    (newDeviceId: string) => {
      tuiRoomCore.setCurrentSpeaker(newDeviceId);
      const selected =
        speakerList.filter(
          (item: TRTCDeviceInfo) => item.deviceId === newDeviceId
        )[0] || null;
      if (selected) {
        setCurrentSpeaker(selected);
      }
    },
    [speakerList, setCurrentSpeaker]
  );

  // 摄像头切换事件处理函数
  const onChangeCamera = useCallback(
    (event: any, cameraDevice: Record<string, any>) => {
      logger.debug(`${logPrefix}onChangeCamera cameraDevice:`, cameraDevice);
      changeCurrentCamera(cameraDevice.deviceId);
    },
    [changeCurrentCamera]
  );

  // 监听摄像头设备切换事件
  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_CHANGE_CURRENT_CAMERA,
      onChangeCamera
    );

    return () => {
      (window as any).electron.ipcRenderer.removeListener(
        EUserEventNames.ON_CHANGE_CURRENT_CAMERA,
        onChangeCamera
      );
    };
  }, [onChangeCamera]);

  // 麦克风切换事件处理函数
  const onChangeMicrophone = useCallback(
    (event: any, microphoneDevice: Record<string, any>) => {
      logger.debug(
        `${logPrefix}onChangeMicrophone microphoneDevice:`,
        microphoneDevice
      );
      changeCurrentMicrophone(microphoneDevice.deviceId);
    },
    [changeCurrentMicrophone]
  );

  // 监听麦克风设备切换事件
  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_CHANGE_CURRENT_MICROPHONE,
      onChangeMicrophone
    );

    return () => {
      (window as any).electron.ipcRenderer.removeListener(
        EUserEventNames.ON_CHANGE_CURRENT_MICROPHONE,
        onChangeMicrophone
      );
    };
  }, [onChangeMicrophone]);

  // 扬声器切换事件处理函数
  const onChangeSpeaker = useCallback(
    (event: any, speakerDevice: Record<string, any>) => {
      logger.debug(`${logPrefix}onChangeSpeaker speakerDevice:`, speakerDevice);
      changeCurrentSpeaker(speakerDevice.deviceId);
    },
    [changeCurrentSpeaker]
  );

  // 监听扬声器设备切换事件
  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_CHANGE_CURRENT_SPEAKER,
      onChangeSpeaker
    );

    return () => {
      (window as any).electron.ipcRenderer.removeListener(
        EUserEventNames.ON_CHANGE_CURRENT_SPEAKER,
        onChangeSpeaker
      );
    };
  }, [onChangeSpeaker]);

  return {
    changeCurrentCamera,
    changeCurrentMic: changeCurrentMicrophone,
    changeCurrentSpeaker,
  };
}

export default useDevice;
