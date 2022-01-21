import React, { useState, useEffect } from 'react';
import logger from '../../../utils/logger';
import { compareUserFn } from '../../../utils/utilFn';
import AsideTabs from '../aside-tabs';
import CameraVideoPlayer from '../../camera-video-player';
import './index.scss';

function ClassAside(props: Record<string, any>) {
  const logPrefix = '[ClassAside]';
  logger.log(`${logPrefix} props:`, props);
  const [validUserList, setValidUserList] = useState<
    Array<Record<string, any>>
  >([]);
  const [teacherInfo, setTeacherInfo] = useState<Record<string, any>>({});
  const {
    currentUser,
    teacherID,
    toggleMicMuteState,
    classMembers,
    messageList,
    sendChatMessage,
  } = props;

  useEffect(() => {
    logger.log(`${logPrefix} useEffect calc validUserList`);
    if (teacherID && currentUser.role && classMembers) {
      classMembers.sort(compareUserFn);
      if (currentUser.role === 'teacher') {
        const validData = classMembers.filter(
          (item: any) => item.userID !== teacherID
        );
        setValidUserList(validData);
      } else {
        // 学生时，排除老师（老师显示在右边栏上方区域），并将自己放在列表最前面
        let isMicMuted = true;
        if (currentUser.isHandUpConfirmed) {
          // 举手被同意，优先级最高
          isMicMuted = currentUser.isMicMuted;
        } else {
          isMicMuted = currentUser.isMutedByTeacher || currentUser.isMicMuted;
        }

        const validData: Array<Record<string, any>> = [
          {
            userID: currentUser.userID,
            isMicStarted: currentUser.isMicStarted,
            isMicMuted,
            isCameraStarted: currentUser.isCameraStarted,
            isLocal: currentUser.isLocal,
          },
        ];
        classMembers.forEach((item: Record<string, any>) => {
          if (item.userID !== currentUser.userID && item.userID !== teacherID) {
            validData.push(item);
          } else if (item.userID === teacherID) {
            setTeacherInfo(item);
          }
        });
        setValidUserList(validData);
      }
    }
  }, [
    currentUser.role,
    classMembers,
    currentUser.isHandUpConfirmed,
    currentUser.userID,
    currentUser.isMicStarted,
    currentUser.isCameraStarted,
    currentUser.isLocal,
    currentUser.isMicMuted,
    currentUser.isMutedByTeacher,
    teacherID,
  ]);

  return (
    <div className="trtc-edu-aside">
      <CameraVideoPlayer
        user={currentUser.role === 'teacher' ? currentUser : teacherInfo}
        toggleMicMuteState={toggleMicMuteState}
      />
      <div className="bottom">
        {teacherID && (
          <AsideTabs
            userList={validUserList}
            toggleMicMuteState={toggleMicMuteState}
            classMembers={classMembers}
            messageList={messageList}
            sendChatMessage={sendChatMessage}
            currentUserID={currentUser.userID}
          />
        )}
      </div>
    </div>
  );
}

export default ClassAside;
