import React from 'react';
import GithubLink from '../toolbar-icon-buttons/github-link';
import CopyNumber from '../toolbar-icon-buttons/copy-number';
import logger from '../../utils/logger';
import Time from '../class-room-title-time/index';
import buildPackageConfig from '../../../../build/app/package.json';
import packageConfig from '../../../../package.json';
import { tuiRoomCore } from '../../core/room-core';
import './index.scss';

function ClassTitle(props: Record<string, any>) {
  const logPrefix = '[ClassTitle]';
  const chatNumber = '695855795';
  const { classStartTime, teacherID, roomID, userID } = props;

  const appVersion = `${buildPackageConfig.version}.${packageConfig.build.buildVersion}`;
  logger.log(`${logPrefix} appVersion:`, appVersion);

  return (
    <div className="trtc-edu-class-room-title">
      <div className="app-version">
        <span className="version">应用版本：{appVersion}</span>
        <span className="version">SDK版本：{tuiRoomCore.getSDKVersion()}</span>
      </div>
      <div className="class-start-time">
        老师：{teacherID} &nbsp;| &nbsp;课堂号：{roomID}{' '}
        <CopyNumber number={roomID} userID={userID} />
        | &nbsp;已上课&nbsp;
        <Time classStartTime={classStartTime} />
      </div>
      <div className="class-chat-group">
        QQ交流群： {chatNumber}
        <CopyNumber number={chatNumber} userID={userID} />
      </div>
      <div>
        <GithubLink />
      </div>
    </div>
  );
}

export default ClassTitle;
