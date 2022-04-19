import a18n from 'a18n';
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
  const { classStartTime, teacherID, roomID, userID, chatNumber } = props;

  const appVersion = `${buildPackageConfig.version}.${packageConfig.build.buildVersion}`;
  logger.log(`${logPrefix} appVersion:`, appVersion);

  return (
    <div className="trtc-edu-class-room-title">
      <div className="app-version">
        <span className="version">
          {a18n('应用版本：')}
          {appVersion}
        </span>
        <span className="version">
          {a18n('SDK版本：')}
          {tuiRoomCore.getSDKVersion()}
        </span>
      </div>
      <div className="class-start-time">
        <span>{a18n.x`老师：${teacherID}`}｜</span>
        <span>
          {a18n('课堂号：')}
          {roomID}
          <CopyNumber number={roomID} chatNumber={chatNumber} />
        </span>
        <span>
          ｜{a18n('已上课')}
          <Time classStartTime={classStartTime} />
        </span>
      </div>
      <div className="class-chat-group">
        <span>
          {a18n('QQ 交流群：')} {chatNumber}
          <CopyNumber number={chatNumber} chatNumber={chatNumber} />
        </span>
        <span>
          <GithubLink />
        </span>
      </div>
    </div>
  );
}

export default ClassTitle;
