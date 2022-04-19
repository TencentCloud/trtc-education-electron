import a18n from 'a18n';
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import {
  TRTCScreenCaptureSourceInfo,
  TRTCScreenCaptureSourceType,
  TRTCVideoQosPreference,
} from 'trtc-electron-sdk/liteav/trtc_define';
import Toast from '../toast';
import { tuiRoomCore } from '../../core/room-core';
import logger from '../../utils/logger';
import './index.scss';

interface PreviewProps {
  screenInfo: TRTCScreenCaptureSourceInfo;
}

function PreviewScreenOrWindow(props: PreviewProps) {
  const logPrefix = '[PreviewScreenOrWindow]';
  const { screenInfo } = props;
  if (!screenInfo.thumbBGRA?.width || !screenInfo.thumbBGRA?.height) {
    logger.error(`${logPrefix} invalid props:`, screenInfo);
  }

  return (
    <canvas
      className="preview-canvas"
      width={screenInfo.thumbBGRA?.width}
      height={screenInfo.thumbBGRA?.height}
      ref={(ref: HTMLCanvasElement | null) => {
        if (ref === null) return;
        if (screenInfo.thumbBGRA?.width && screenInfo.thumbBGRA?.height) {
          const ctx: CanvasRenderingContext2D | null = ref.getContext('2d');
          const img: ImageData = new ImageData(
            new Uint8ClampedArray(screenInfo.thumbBGRA?.buffer as any),
            screenInfo.thumbBGRA?.width,
            screenInfo.thumbBGRA?.height
          );
          if (ctx != null) {
            ctx.putImageData(img, 0, 0);
          }
        }
      }}
      data-id={screenInfo.sourceId}
    />
  );
}

interface ShareScreenSelectionProps {
  onSelect: (screenInfo: TRTCScreenCaptureSourceInfo) => void;
  appWindowIDs: Array<string>;
}

function ShareScreenSelection(props: ShareScreenSelectionProps) {
  const { onSelect: onParentSelection, appWindowIDs } = props;
  const [selected, setSelected] = useState<string>('');
  const screenCaptureList: Array<TRTCScreenCaptureSourceInfo> =
    tuiRoomCore.getScreenCaptureSources(160, 90, 32, 32);
  const screenTypeList = screenCaptureList.filter(
    (screen) =>
      screen.type ===
      TRTCScreenCaptureSourceType.TRTCScreenCaptureSourceTypeScreen
  );
  const windowTypeList = screenCaptureList.filter(
    (screen) =>
      screen.type ===
        TRTCScreenCaptureSourceType.TRTCScreenCaptureSourceTypeWindow &&
      !screen.isMinimizeWindow && // 非最小化
      appWindowIDs.indexOf(screen.sourceId) === -1 // 非当前应用窗口
  );

  function onSelect(
    event: React.SyntheticEvent,
    screenInfo: TRTCScreenCaptureSourceInfo
  ) {
    const currentTarget = event.currentTarget as HTMLElement;
    const id = currentTarget.dataset.id as string;
    setSelected(id);
    onParentSelection(screenInfo);
  }
  return (
    <div className="share-screen-selection">
      <div>
        <h3>{a18n('屏幕')}</h3>
        <ul className="preview-list screen-preview-list">
          {screenTypeList.map((screen) => {
            return (
              <li
                className={`preview-list-item ${
                  screen.sourceId === selected ? 'selected' : ''
                }`}
                key={screen.sourceId}
              >
                <div
                  className="preview-wrapper"
                  data-id={screen.sourceId}
                  onClick={(e) => onSelect(e, screen)}
                >
                  <PreviewScreenOrWindow screenInfo={screen} />
                </div>
                <div className="preview-name">{screen.sourceName}</div>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <h3>{a18n('窗口')}</h3>
        <ul className="preview-list window-preview-list">
          {windowTypeList.map((win) => {
            return (
              <li
                className={`preview-list-item ${
                  win.sourceId === selected ? 'selected' : ''
                }`}
                key={win.sourceId}
              >
                <div
                  className="preview-wrapper"
                  data-id={win.sourceId}
                  onClick={(e) => onSelect(e, win)}
                >
                  <PreviewScreenOrWindow screenInfo={win} />
                </div>
                <div className="preview-name">{win.sourceName}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function OptionalButton() {
  const [state, setState] = useState({
    systemSound: false,
    netWorkFlow: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
    if (event.target.checked) {
      if (event.target.name === 'systemSound') {
        // 采集整个系统的声音
        tuiRoomCore.startSystemAudioLoopback();
      }
      if (event.target.name === 'netWorkFlow') {
        tuiRoomCore.setVideoQosPreference(
          TRTCVideoQosPreference.TRTCVideoQosPreferenceSmooth
        );
      }
    } else {
      if (event.target.name === 'systemSound') {
        tuiRoomCore.stopSystemAudioLoopback();
      }
      if (event.target.name === 'netWorkFlow') {
        tuiRoomCore.setVideoQosPreference(
          TRTCVideoQosPreference.TRTCVideoQosPreferenceClear
        );
      }
    }
  };

  return (
    <FormGroup row>
      <FormControlLabel
        control={
          <Checkbox
            checked={state.systemSound}
            onChange={handleChange}
            name="systemSound"
            color="primary"
          />
        }
        label={a18n('同时共享电脑声音')}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={state.netWorkFlow}
            onChange={handleChange}
            name="netWorkFlow"
            color="primary"
          />
        }
        label={a18n('视频流畅度优先')}
      />
    </FormGroup>
  );
}

interface ShareScreenSelectionDialogProps {
  show: boolean | false;
  onCancel: () => void;
  onConfirm: (screenSource: TRTCScreenCaptureSourceInfo | null) => void;
  appWindowIDs: Array<string>;
}
function ShareScreenSelectionDialog(props: ShareScreenSelectionDialogProps) {
  const logPrefix = '[ShareScreenSelectionDialog]';
  logger.log(`${logPrefix}.props:`, props);
  const [screenInfo, setScreenInfo] =
    useState<TRTCScreenCaptureSourceInfo | null>(null);
  const { show, onCancel, onConfirm, appWindowIDs } = props;

  const onSelect = (screenSource: TRTCScreenCaptureSourceInfo) => {
    setScreenInfo(screenSource);
  };

  const handleConfirm = () => {
    if (screenInfo) {
      onConfirm(screenInfo);
    } else {
      Toast.info(a18n('请选择需要分享的屏幕或窗口'), 10000);
    }
  };

  return (
    <Dialog
      className="screen-sharing-selection-dialog"
      fullWidth
      maxWidth="md"
      open={show}
      onClose={onCancel}
      aria-labelledby="screen-sharing-selection-dialog-title"
    >
      <DialogTitle id="screen-sharing-selection-dialog-title">
        {a18n('选择要分享的屏幕或应用窗口')}
      </DialogTitle>
      <DialogContent dividers>
        <ShareScreenSelection onSelect={onSelect} appWindowIDs={appWindowIDs} />
      </DialogContent>
      <DialogActions>
        <div className="screen-sharing-selection-dialog-buttons">
          <div className="screen-sharing-selection-dialog-choose">
            <OptionalButton />
          </div>
          <div className="screen-sharing-selection-dialog-confirm">
            <Button color="primary" onClick={handleConfirm}>
              {a18n('确认')}
            </Button>
            <Button onClick={onCancel}>{a18n('取消')}</Button>
          </div>
        </div>
      </DialogActions>
    </Dialog>
  );
}

export default ShareScreenSelectionDialog;
