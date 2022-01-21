import React from 'react';
import HorizontalList from './horizontal-list';
import VerticalList from './vertical-list';
import logger from '../../utils/logger';
import './index.scss';

interface Props {
  userList?: Array<Record<string, any>>;
  mode?: string;
  toggleMicMuteState: (user: Record<string, any>) => void;
}

function CameraVideoList(props: Props) {
  const logPrefix = '[CameraVideoList]';
  const { userList, mode, toggleMicMuteState } = props;

  logger.log(`${logPrefix} props: `, JSON.stringify(props));

  return (
    <div className={`trtc-edu-camera-video-list list-mode-${mode}`}>
      {mode === 'horizontal' ? (
        <HorizontalList
          userList={userList}
          toggleMicMuteState={toggleMicMuteState}
        />
      ) : (
        <VerticalList
          userList={userList}
          toggleMicMuteState={toggleMicMuteState}
        />
      )}
    </div>
  );
}

CameraVideoList.defaultProps = {
  userList: [],
  mode: 'horizontal',
};

export default CameraVideoList;
