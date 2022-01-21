import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useClassMember from '../../../hooks/use-class-member';
import useMessageList from '../../../hooks/use-message-list';
import StudentSignIn from '../../../components/student-sign-in';
import logger from '../../../utils/logger';
import useDevice from '../../../hooks/use-device';
import {
  updateDeviceState,
  updateIsMutedByTeacher,
  updateIsHandUpConfirmed,
} from '../../../store/user/userSlice';
import Toast from '../../../components/toast';
import Toolbar from './section/toolbar';
import TitleBar from '../../../components/class-room-title-bar';
import AsidePanel from '../../../components/class-room-layout/aside-panel';
import ConfirmDialog from '../../../components/confirm-dialog';
import {
  updateStartTime,
  updateIsAllMicrophoneMuted,
  updateOwnerID,
} from '../../../store/room-info/roomInfoSlice';
import {
  tuiRoomCore,
  ETUIRoomEvents,
  ETUIStreamType,
  ETUISignalStatus,
} from '../../../core/room-core';
import './index.scss';

function StudentHome() {
  const logPrefix = '[StudentHome]';
  const refShareScreen = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.user);
  const userID = useSelector((state: any) => state.user.userID);
  const roomID = useSelector((state: any) => state.user.roomID);
  const role = useSelector((state: any) => state.user.role);
  const roomInfo = useSelector((state: any) => state.roomInfo);
  const [teacherID, setTeacherID] = useState<string>('');
  const [callingRollStatus, setCallingRollStatus] = useState<boolean>(false);
  const [dialogToggle, setDialogToggle] = useState<boolean>(false);
  const [dialogConfig] = useState<Record<string, any>>({
    confirmText: '接受',
    cancelText: '拒绝',
    children: '老师邀请您上台发言',
  });

  const { changeCurrentCamera, changeCurrentMic, changeCurrentSpeaker } =
    useDevice();
  const cameraList = useSelector((state: any) => state.device.cameraList);
  const microphoneList = useSelector((state: any) => state.device.microphoneList); // eslint-disable-line
  const speakerList = useSelector((state: any) => state.device.speakerList);

  useClassMember();
  const userMap = useSelector((state: any) => state.userMap.userMap);

  const { startTime } = roomInfo;

  const { sendChatMessage } = useMessageList();
  const messageList = useSelector((state: any) => state.message.messages);

  const updateMicMuteState = useCallback(
    (mute: boolean) => {
      if (currentUser.isMutedByTeacher && !currentUser.isHandUpConfirmed) {
        Toast.info('您已被老师禁言，需要发言请先举手。', 10000);
        return;
      }
      tuiRoomCore.muteLocalMicrophone(mute);
      dispatch(
        updateDeviceState({
          isMicMuted: mute,
        })
      );
    },
    [currentUser.isMutedByTeacher, currentUser.isHandUpConfirmed, dispatch]
  );

  const updateCameraState = (started: boolean) => {
    dispatch(
      updateDeviceState({
        isCameraStarted: started,
      })
    );
  };

  const onUserVideoAvailableHandler = useCallback(
    (args: Record<string, any>) => {
      logger.log(`${logPrefix}onUserVideoAvailableHandler args:`, args);
      // 只处理屏幕分享
      if (args.data.streamType === ETUIStreamType.SCREEN) {
        if (args.data.available) {
          if (refShareScreen.current) {
            tuiRoomCore.startRemoteView(
              args.data.userID,
              refShareScreen.current,
              ETUIStreamType.SCREEN
            );
          }
        } else {
          tuiRoomCore.stopRemoteView(args.data.userID, ETUIStreamType.SCREEN);
        }
      }
    },
    []
  );

  const onMicrophoneMutedHandler = useCallback(
    (event: { data: boolean; eventCode: string }) => {
      if (currentUser.role === 'student') {
        dispatch(updateIsMutedByTeacher(event.data));
        dispatch(updateIsAllMicrophoneMuted(event.data));
      }
    },
    [currentUser.role, dispatch]
  );

  const onCallRollStartHandler = (event: {
    data: boolean;
    eventCode: string;
  }) => {
    logger.log(`${logPrefix}.onCallRollStartHandler`, event);
    if (event.data) {
      setCallingRollStatus(event.data);
    }
  };

  const onCallRollStopHandler = (event: {
    data: boolean;
    eventCode: string;
  }) => {
    if (!event.data) {
      logger.log(`${logPrefix}.onCallRollStopHandler`, event.data);
      setCallingRollStatus(event.data);
    }
  };

  const onConfirmHandUpHandler = useCallback(() => {
    dispatch(updateIsHandUpConfirmed(true));
    const mute = false;
    tuiRoomCore.muteLocalMicrophone(mute);
    dispatch(
      updateDeviceState({
        isMicMuted: mute,
      })
    );
  }, [dispatch]);

  // 举手
  const sendHandUpMessage = async () => {
    try {
      const response = await tuiRoomCore.sendSpeechApplication();
      logger.log(`${logPrefix}sendHandUpMessage result:`, response);
      switch (response.code) {
        case ETUISignalStatus.ACCEPTED:
          // 举手发言被允许
          Toast.info('老师已同意您的举手申请，现在可以发言了', 3000);
          onConfirmHandUpHandler();
          break;
        case ETUISignalStatus.REJECTED:
          Toast.info('举手申请被拒绝');
          break;
        case ETUISignalStatus.CANCELLED:
          Toast.info('举手申请已取消');
          break;
        case ETUISignalStatus.TIMEOUT:
          Toast.info('举手申请超时');
          break;
        default:
          logger.error(
            `${logPrefix}.sendHandupMessage unknown response coce:`,
            response.code
          );
          break;
      }
    } catch (error) {
      logger.error(`${logPrefix} [sendHandUpMessage] hands-up error`, error);
    }
  };

  const onReceiveSpeechInvitationHandler = (event: { eventCode: string }) => {
    logger.warn(`${logPrefix}onReceiveSpeechInvitationHandler event:`, event);
    setDialogToggle(true);
  };

  const onReceiveInvitationCancelledHandler = (event: {
    eventCode: string;
  }) => {
    logger.warn(
      `${logPrefix}onReceiveInvitationCancelledHandler event:`,
      event
    );
    setDialogToggle(false);
  };

  const onReceiveInvitationTimeoutHandler = (event: { eventCode: string }) => {
    logger.warn(`${logPrefix}onReceiveInvitationTimeoutHandler event:`, event);
    setDialogToggle(false);
    Toast.info(`上台邀请已超时`, 1000);
  };

  // 注册事件监听
  useEffect(() => {
    // 监听远端用户屏幕分享
    tuiRoomCore.on(
      ETUIRoomEvents.onUserVideoAvailable,
      onUserVideoAvailableHandler
    );
    // 监听老师发出的开始签到请求
    tuiRoomCore.on(ETUIRoomEvents.onCallingRollStarted, onCallRollStartHandler);
    // 监听老师发出的结束签到请求
    tuiRoomCore.on(ETUIRoomEvents.onCallingRollStopped, onCallRollStopHandler);
    // 监听麦克风静音/取消静音事件
    tuiRoomCore.on(ETUIRoomEvents.onMicrophoneMuted, onMicrophoneMutedHandler);
    // 监听老师发出邀请上台的请求
    tuiRoomCore.on(
      ETUIRoomEvents.onReceiveSpeechInvitation,
      onReceiveSpeechInvitationHandler
    );
    // 监听老师取消邀请上台的请求
    tuiRoomCore.on(
      ETUIRoomEvents.onReceiveInvitationCancelled,
      onReceiveInvitationCancelledHandler
    );
    // 监听老师邀请上台的请求超时
    tuiRoomCore.on(
      ETUIRoomEvents.onReceiveInvitationTimeout,
      onReceiveInvitationTimeoutHandler
    );
    return () => {
      tuiRoomCore.off(
        ETUIRoomEvents.onUserVideoAvailable,
        onUserVideoAvailableHandler
      );
      // 取消监听老师发出的开始签到请求
      tuiRoomCore.off(
        ETUIRoomEvents.onCallingRollStarted,
        onCallRollStartHandler
      );
      // 取消监听老师发出的结束签到请求
      tuiRoomCore.off(
        ETUIRoomEvents.onCallingRollStopped,
        onCallRollStopHandler
      );
      // 取消监听全员禁麦事件
      tuiRoomCore.off(
        ETUIRoomEvents.onMicrophoneMuted,
        onMicrophoneMutedHandler
      );
      // 取消监听老师发出邀请上台的请求
      tuiRoomCore.off(
        ETUIRoomEvents.onReceiveSpeechInvitation,
        onReceiveSpeechInvitationHandler
      );
      // 取消监听老师取消邀请上台的请求
      tuiRoomCore.off(
        ETUIRoomEvents.onReceiveInvitationCancelled,
        onReceiveInvitationCancelledHandler
      );
      // 取消监听老师邀请上台的请求超时
      tuiRoomCore.off(
        ETUIRoomEvents.onReceiveInvitationTimeout,
        onReceiveInvitationTimeoutHandler
      );
    };
  }, [onMicrophoneMutedHandler, onUserVideoAvailableHandler]);

  useEffect(() => {
    async function enterClassRoom() {
      try {
        const { userSig, sdkAppId } = await (
          window as any
        ).electron.genTestUserSig(userID);
        if (role === 'student') {
          await tuiRoomCore.login(sdkAppId, userID, userSig);
          const tuiResponse = await tuiRoomCore.enterRoom(roomID);
          dispatch(updateStartTime(tuiResponse.data.roomConfig.startTime));
          dispatch(updateOwnerID(tuiResponse.data.ownerID));
          logger.log(`${logPrefix}.enterClassRoom:`, tuiResponse);
          setTeacherID(tuiResponse.data.ownerID);

          // 开启设别
          tuiRoomCore.startMicrophone();
        }
      } catch (error) {
        Toast.error('进入课堂失败');
      }
    }
    if (userID && roomID && role) {
      enterClassRoom();
    }
  }, [userID, roomID, role, dispatch]);

  const toggleMicMuteState = useCallback(
    (user: Record<string, any>) => {
      if (user.userID === userID) {
        // 当前学生修改自己的麦克风状态
        updateMicMuteState(user.isMicStarted && !user.isMicMuted);
      } else {
        // 当前学生不能修改其他学生的麦克风状态
        logger.log(
          `${logPrefix}.toggleMicMuteState current userID: ${userID} cannot modify mic of other userID: ${user.userID}`
        );
      }
    },
    [updateMicMuteState, userID]
  );

  // 签到
  const signOn = async () => {
    logger.log(`${logPrefix}.signOn:`, userID);
    try {
      await tuiRoomCore.replyCallingRoll();
      setCallingRollStatus(false);
      Toast.info('签到成功！', 1000);
    } catch (error) {
      Toast.error('签到失败！', 1000);
    }
  };

  // 接受上台
  const handleDialogConfirm = async () => {
    await tuiRoomCore.replySpeechInvitation(true);
    Toast.info(`接受上台`, 1000);
    onConfirmHandUpHandler();
    setDialogToggle(false);
  };

  // 拒绝上台
  const handleDialogCancel = async () => {
    await tuiRoomCore.replySpeechInvitation(false);
    Toast.info(`拒绝上台`, 1000);
    setDialogToggle(false);
  };

  const classUserList = Object.values(userMap) as Record<string, any>[];

  let isMicMuted = true;
  if (currentUser.isHandUpConfirmed) {
    // 举手被同意，优先级最高
    isMicMuted = currentUser.isMicMuted;
  } else {
    isMicMuted = currentUser.isMutedByTeacher || currentUser.isMicMuted;
  }

  return (
    <div className="student-class-room">
      <header className="class-room-header">
        <TitleBar
          classStartTime={startTime}
          teacherID={teacherID}
          roomID={currentUser.roomID}
        />
      </header>
      <div className="class-room-body">
        <div className="main-content">
          <div className="white-board" ref={refShareScreen} />
          {callingRollStatus && <StudentSignIn signOn={signOn} />}
          <div className="class-room-footer">
            <Toolbar
              role={currentUser.role}
              isCameraStarted={currentUser.isCameraStarted}
              cameraList={cameraList}
              currentCameraID={currentUser.currentCamera?.deviceId || ''}
              resetCurrentCamera={changeCurrentCamera}
              updateCameraState={updateCameraState}
              isMicMute={isMicMuted}
              microphoneList={microphoneList}
              currentMicrophoneID={currentUser.currentMic?.deviceId || ''}
              resetCurrentMicrophone={changeCurrentMic}
              updateMicMuteState={updateMicMuteState}
              speakerList={speakerList}
              currentSpeakerID={currentUser.currentSpeaker?.deviceId || ''}
              resetCurrentSpeaker={changeCurrentSpeaker}
              handsUpHandler={sendHandUpMessage}
            />
          </div>
        </div>
        <div className="aside-content">
          <AsidePanel
            currentUser={currentUser}
            teacherID={teacherID}
            toggleMicMuteState={toggleMicMuteState}
            classMembers={classUserList}
            messageList={messageList}
            sendChatMessage={sendChatMessage}
          />
        </div>
        <ConfirmDialog
          show={dialogToggle}
          confirmText={dialogConfig.confirmText}
          cancelText={dialogConfig.cancelText}
          onConfirm={handleDialogConfirm}
          onCancel={handleDialogCancel}
        >
          {dialogConfig.children}
        </ConfirmDialog>
      </div>
    </div>
  );
}

export default StudentHome;
