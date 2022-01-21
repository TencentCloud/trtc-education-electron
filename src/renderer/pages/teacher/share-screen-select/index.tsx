import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TRTCScreenCaptureSourceInfo } from 'trtc-electron-sdk/liteav/trtc_define';
import { EUserEventNames } from '../../../../constants';
import logger from '../../../utils/logger';
import ShareScreenSelectDialog from '../../../components/share-screen-select-dialog';

import './index.scss';

function ShareScreenSelect() {
  const logPrefix = '[ShareScreenSelect]';
  const [isVisible, setIsVisible] = useState(true);

  const windowBaseInfoMap = useSelector(
    (state: any) => state.env.windowBaseInfoMap
  );

  const onCancel = () => {
    // setIsVisible(false);
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CANCEL_SHARE_SCREEN_WINDOW
    );
  };

  const onConfirm = (screenSource: TRTCScreenCaptureSourceInfo | null) => {
    // setIsVisible(false);
    if (screenSource) {
      (window as any).electron.ipcRenderer.send(
        EUserEventNames.ON_CONFIRM_SHARE_SCREEN_WINDOW,
        screenSource
      );
    } else {
      logger.error(`${logPrefix}onConfirm with null screenSource`);
    }
  };

  const windowIDs: Array<string> = Object.values(windowBaseInfoMap).map(
    (item: any) => item.mediaSourceId
  );

  return (
    <div className="share-screen-select-page">
      <ShareScreenSelectDialog
        show={isVisible}
        onCancel={onCancel}
        onConfirm={onConfirm}
        appWindowIDs={windowIDs}
      />
    </div>
  );
}

export default ShareScreenSelect;
