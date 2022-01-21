import React from 'react';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import CheckIcon from '@material-ui/icons/Check';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { TRTCDeviceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import { EPopupType } from '../../../../types';
import BaseToolIconButton from '../base';
import './index.scss';

function CameraList(
  camList: Array<any>,
  currentCamId: string | undefined | null,
  handleUpdateCurrentCam: (id: any) => void
) {
  return (
    <List dense className="camera-device-list">
      {[...camList].map((cam) => {
        return (
          <ListItem
            className="camera-device-item"
            key={cam.deviceId}
            onClick={() => handleUpdateCurrentCam(cam.deviceId)}
          >
            <div className="check-wrapper">
              {cam.deviceId === currentCamId ? <CheckIcon /> : null}
            </div>
            <div className="device-name">{cam.deviceName}</div>
          </ListItem>
        );
      })}
    </List>
  );
}

interface CameraControllerProps {
  mode?: string;
  isStarted: boolean;
  cameraList: Array<TRTCDeviceInfo>;
  currentID?: string | undefined | null;
  updateState: (started: boolean) => void;
  popupType: EPopupType;
  resetCurrentCamera?: (id: string) => void | null;
  onOpenOuterPopover?: (data: any) => void;
}

function CameraController(props: CameraControllerProps) {
  const {
    mode,
    isStarted,
    cameraList,
    currentID,
    popupType,
    resetCurrentCamera,
    updateState,
    onOpenOuterPopover,
  } = props;

  const onChangeCamera = (newDeviceId: string) => {
    if (currentID === newDeviceId) {
      return;
    }

    if (resetCurrentCamera) {
      resetCurrentCamera(newDeviceId);
    }
  };

  const renderIcon = () => {
    return <>{isStarted ? <VideocamIcon /> : <VideocamOffIcon />}</>;
  };

  const renderPopoverContent = () => {
    return CameraList(cameraList, currentID, onChangeCamera);
  };

  const toggleMuteStatus = () => {
    updateState(!isStarted);
  };

  return popupType === EPopupType.InnerWindow ? (
    <BaseToolIconButton
      name="摄像头"
      muted={!isStarted}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={toggleMuteStatus}
      popupType={EPopupType.InnerWindow}
      renderInnerPopover={renderPopoverContent}
    />
  ) : (
    <BaseToolIconButton
      name="摄像头"
      muted={!isStarted}
      mode={mode}
      renderIcon={renderIcon}
      onClickIcon={toggleMuteStatus}
      popupType={EPopupType.OuterWindow}
      onOpenOuterPopover={onOpenOuterPopover}
    />
  );
}

CameraController.defaultProps = {
  currentID: '',
  mode: 'small',
  resetCurrentCamera: null,
  onOpenOuterPopover: (data: any) => {},
};

export default CameraController;
