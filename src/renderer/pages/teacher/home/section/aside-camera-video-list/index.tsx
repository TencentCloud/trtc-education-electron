import React from 'react';
import CameraVideoList from '../../../../../components/camera-video-list';
import { compareUserFn } from '../../../../../utils/utilFn';
import logger from '../../../../../utils/logger';

function AsideCameraVideoList(props: Record<string, any>) {
  const logPrefix = '[AsideCameraVideoList]';
  const { classMemberList, toggleMicMuteState } = props;
  // 将当前用户排在最前面，再按是否开启摄像头、是否开启麦克风、userID 升序排序
  classMemberList.sort(
    (first: Record<string, any>, second: Record<string, any>) => {
      if (first.isLocal) {
        return -1;
      }
      if (second.isLocal) {
        return 1;
      }
      return compareUserFn(first, second);
    }
  );

  logger.log(`${logPrefix}.classMemberList:`, classMemberList);

  return (
    <CameraVideoList
      userList={classMemberList}
      mode="vertical"
      toggleMicMuteState={toggleMicMuteState}
    />
  );
}

export default AsideCameraVideoList;
