import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import logger from '../../../../utils/logger';
import { EUserEventNames } from '../../../../../constants';
import {
  initCurrentUserStore,
  updateAllStudentMuteState,
  updateRollState,
} from '../../../../store/user/userSlice';
import { updateIsAllMicrophoneMuted } from '../../../../store/room-info/roomInfoSlice';
import { updateUser } from '../../../../store/user-map/userMapSlice';
import { tuiRoomCore } from '../../../../core/room-core';

function useTopToolbarEvent() {
  const logPrefix = '[useTopToolbarNotice]';
  const currentUser = useSelector((state: any) => state.user);
  const userMap = useSelector((state: any) => state.userMap.userMap);
  const dispatch = useDispatch();

  const onChangeLocalUserState = useCallback(
    (event: any, options: Record<string, any>) => {
      logger.log(`${logPrefix}.onChangeLocalUserState options:`, options);
      const newUser: Record<string, any> = {};
      Object.keys(options).forEach(async (key: string) => {
        switch (key) {
          case 'isCameraStarted':
            newUser.isVideoStreamAvailable = options[key];
            break;
          case 'isMicMuted':
            tuiRoomCore.muteLocalMicrophone(options[key]);
            break;
          case 'isAllStudentMuted':
            try {
              await tuiRoomCore.muteAllUsersMicrophone(options[key]);
              dispatch(updateAllStudentMuteState(options[key]));
              dispatch(updateIsAllMicrophoneMuted(options[key]));
              (window as any).appMonitor?.reportEvent('MuteAll');
            } catch (error) {
              logger.error(
                `${logPrefix}onChangeLocalUserState muteAllUsersMicrophone error`,
                error
              );
            }
            break;
          case 'isRolled':
            try {
              if (options[key]) {
                await tuiRoomCore.startCallingRoll();
                (window as any).appMonitor?.reportEvent('StartCallRoll');
              } else {
                await tuiRoomCore.stopCallingRoll();
                (window as any).appMonitor?.reportEvent('StopCallRoll');
              }
              dispatch(updateRollState(options[key]));
            } catch (error) {
              logger.error(
                `${logPrefix}onChangeLocalUserState start/stopCallingRoll error`,
                error
              );
            }
            break;
          default:
            logger.log(
              `${logPrefix}onChangeLocalUserState unknown property:`,
              key
            );
        }
      });

      dispatch(
        initCurrentUserStore({
          ...currentUser,
          ...options,
        })
      );
      const user = userMap[currentUser.userID];
      dispatch(
        updateUser({
          ...user,
          ...options,
          ...newUser,
        })
      );
    },
    [currentUser, dispatch, userMap]
  );

  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
      onChangeLocalUserState
    );
    return () => {
      (window as any).electron.ipcRenderer.removeListener(
        EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
        onChangeLocalUserState
      );
    };
  }, [onChangeLocalUserState]);
}

export default useTopToolbarEvent;
