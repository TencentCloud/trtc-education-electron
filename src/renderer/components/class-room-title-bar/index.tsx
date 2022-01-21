import React from 'react';
import logger from '../../utils/logger';
import Time from '../class-room-title-time/index';
import buildPackageConfig from '../../../../build/app/package.json';
import packageConfig from '../../../../package.json';
import { tuiRoomCore } from '../../core/room-core';
import './index.scss';

function ClassTitle(props: Record<string, any>) {
  const logPrefix = '[ClassTitle]';
  const { classStartTime, teacherID, roomID } = props;

  const appVersion = `${buildPackageConfig.version}.${packageConfig.build.buildVersion}`;
  logger.log(`${logPrefix} appVersion:`, appVersion);

  return (
    <div className="trtc-edu-class-room-title">
      <div className="app-version">
        <span className="version">应用版本：{appVersion}</span>
        <span className="version">SDK版本：{tuiRoomCore.getSDKVersion()}</span>
      </div>
      <div className="class-start-time">
        {teacherID} 发起的在线课堂 {roomID} | &nbsp;已上课&nbsp;
        <Time classStartTime={classStartTime} />
      </div>
      <div>
        <span>QQ交流群：695855795</span>
      </div>
    </div>
  );
}

export default ClassTitle;
