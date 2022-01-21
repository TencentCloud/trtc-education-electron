import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import logger from '../../utils/logger';
import {
  tuiRoomCore,
  ETUIRoomEvents,
  ETUIRoomRole,
} from '../../core/room-core';
import {
  addUser,
  deleteUser,
  updateUser,
} from '../../store/user-map/userMapSlice';
import { EUserEventNames } from '../../../constants';

function useClassMember() {
  const logPrefix = '[useClassMember]';
  const dispatch = useDispatch();

  const convertUser = (tuiRoomUser: Record<string, any>) => {
    return {
      ...tuiRoomUser,
      userID: tuiRoomUser.ID,
      role: tuiRoomUser.role === ETUIRoomRole.MASTER ? 'Owner' : 'Member',
      isCameraStarted: tuiRoomUser.isVideoStreamAvailable,
      isMicStarted: true, // 麦克风永远是开始状态，是否有上行数据通过 isMicMuted 控制
      isMicMuted: !tuiRoomUser.isAudioStreamAvailable,
    };
  };

  const onUserEnterRoomHandler = (event: Record<string, any>) => {
    logger.log(`${logPrefix}onUserEnterRoomHandler event:`, event);
    const convertedUser = convertUser(event.data);
    dispatch(addUser(convertedUser));

    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_ADD_USER,
      convertedUser
    );
  };

  const onUserLeaveRoomHandler = (event: Record<string, any>) => {
    logger.log(`${logPrefix}onUserLeaveRoomHandler event:`, event);
    const convertedUser = convertUser(event.data);
    dispatch(deleteUser(convertedUser));

    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_DELETE_USER,
      convertedUser
    );
  };

  const onUserStateChangeHandler = (event: Record<string, any>) => {
    logger.log(`${logPrefix}onUserStateChangeHandler event:`, event);
    const convertedUser = convertUser(event.data);
    dispatch(updateUser(convertedUser));

    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_UPDATE_USER,
      convertedUser
    );
  };

  const onUserVideoAvailableHandler = (options: Record<string, any>) => {
    logger.log(`${logPrefix}onUserVideoAvailableHandler options:`, options);
  };

  const onUserAudioAvailableHandler = (options: Record<string, any>) => {
    logger.log(`${logPrefix}onUserAudioAvailableHandler options:`, options);
  };

  const onUserReplyCallingRoll = (options: Record<string, any>) => {
    logger.log(`${logPrefix}onUserReplyCallingRoll options:`, options.data);
    const { inviterID } = options.data;
    dispatch(
      updateUser({
        ID: inviterID,
        isCallingRoll: true,
      })
    );
  };

  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onUserEnterRoom, onUserEnterRoomHandler);
    tuiRoomCore.on(ETUIRoomEvents.onUserLeaveRoom, onUserLeaveRoomHandler);
    tuiRoomCore.on(ETUIRoomEvents.onUserVideoAvailable, onUserVideoAvailableHandler); // eslint-disable-line
    tuiRoomCore.on(ETUIRoomEvents.onUserAudioAvailable, onUserAudioAvailableHandler); // eslint-disable-line
    tuiRoomCore.on(ETUIRoomEvents.onUserReplyCallingRoll, onUserReplyCallingRoll); // eslint-disable-line
    tuiRoomCore.on(ETUIRoomEvents.onUserStateChange, onUserStateChangeHandler); // eslint-disable-line

    return () => {
      tuiRoomCore.off(ETUIRoomEvents.onUserEnterRoom, onUserEnterRoomHandler);
      tuiRoomCore.off(ETUIRoomEvents.onUserLeaveRoom, onUserLeaveRoomHandler);
      tuiRoomCore.off(ETUIRoomEvents.onUserVideoAvailable, onUserVideoAvailableHandler); // eslint-disable-line
      tuiRoomCore.off(ETUIRoomEvents.onUserAudioAvailable, onUserAudioAvailableHandler); // eslint-disable-line
      tuiRoomCore.off(ETUIRoomEvents.onUserReplyCallingRoll, onUserReplyCallingRoll); // eslint-disable-line
      tuiRoomCore.off(ETUIRoomEvents.onUserStateChange, onUserStateChangeHandler); // eslint-disable-line
    };
  }, []);
}

export default useClassMember;
