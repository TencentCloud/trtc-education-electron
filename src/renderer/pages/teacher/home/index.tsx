import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Rect,
  TRTCVideoEncParam,
  TRTCVideoResolution,
  TRTCVideoResolutionMode,
} from 'trtc-electron-sdk/liteav/trtc_define';
import Button from '@material-ui/core/Button';
import MaximizeIcon from '../../../components/ui-widget/icon/svg-icon/maximize';
import MinimizeIcon from '../../../components/ui-widget/icon/svg-icon/minimize';
import useClassMember from '../../../hooks/use-class-member';
import useMessageList from '../../../hooks/use-message-list';
import { EUserEventNames } from '../../../../constants';
import Toolbar from './section/toolbar';
import TitleBar from '../../../components/class-room-title-bar';
import AsidePanel from '../../../components/class-room-layout/aside-panel';
import AsideCameraVideoList from './section/aside-camera-video-list';
import logger from '../../../utils/logger';
import {
  tuiRoomCore,
  ETUISignalStatus,
  ETUIRoomEvents,
} from '../../../core/room-core';
import Toast from '../../../components/toast';
import {
  updateDeviceState,
  updateAllStudentMuteState,
  updateRollState,
} from '../../../store/user/userSlice';
import {
  updateStartTime,
  updateIsAllMicrophoneMuted,
  updateOwnerID,
} from '../../../store/room-info/roomInfoSlice';
import useDevice from '../../../hooks/use-device';
import WhiteboardPanel from './section/whiteboard-panel';
import { EEventSource, EWindowMode, EWindowSizeMode } from '../../../../types';
import useWhiteboard from './hook/use-whiteboard';
import useTopToolbarEvent from './hook/use-top-toolbar-event';
import './index.scss';

function HomePage() {
  const logPrefix = '[TeacherHomePage]';
  const [windowMode, setWindowMode] = useState<EWindowMode>(
    EWindowMode.Whiteboard
  );
  const [videoListWindowMode, setVideoListWindowMode] =
    useState<EWindowSizeMode>(EWindowSizeMode.Maximize);
  const [handsList, setHandsList] = useState<Array<string>>([]);
  const [speechInvitationList, setSpeechInvitationList] = useState<
    Array<string>
  >([]);

  useDevice();
  useClassMember();
  const { sendChatMessage } = useMessageList();
  const { setWhiteboardBound, startShareWhiteBoard } = useWhiteboard({ windowMode }); // eslint-disable-line
  useTopToolbarEvent();

  const currentUser = useSelector((state: any) => state.user);
  const roomInfo = useSelector((state: any) => state.roomInfo);
  const cameraList = useSelector((state: any) => state.device.cameraList);
  const microphoneList = useSelector((state: any) => state.device.microphoneList); // eslint-disable-line
  const speakerList = useSelector((state: any) => state.device.speakerList);
  const messageList = useSelector((state: any) => state.message.messages);
  const userMap = useSelector((state: any) => state.userMap.userMap);

  const dispatch = useDispatch();
  const { isAllStudentMuted, roomID, userID, role, isRolled } = currentUser;

  const { startTime } = roomInfo;

  // 创建课堂
  useEffect(() => {
    async function createClassRoom() {
      logger.log(`${logPrefix}.createClassRoom enter`);
      try {
        const { userSig, sdkAppId } = await (
          window as any
        ).electron.genTestUserSig(userID);
        if (role === 'teacher') {
          await tuiRoomCore.login(sdkAppId, userID, userSig);
          const tuiResponse = await tuiRoomCore.createRoom(roomID);
          dispatch(updateStartTime(tuiResponse.data.roomConfig.startTime));
          dispatch(updateOwnerID(tuiResponse.data.ownerID));
          logger.log(`${logPrefix}.enterClassRoom:`, tuiResponse);

          // 开启设备
          tuiRoomCore.startMicrophone();

          // 在主进程中设置用户默认数据
          (window as any).electron.ipcRenderer.send(
            EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
            {
              userID,
              isCameraStarted: true,
              isMicStarted: true,
              isMicMuted: false,
              classStartTime: tuiResponse.data.roomConfig.startTime,
            }
          );
        }
      } catch (error) {
        logger.error(`${logPrefix}enterClassRoom error:`, error);
        Toast.error('创建课堂失败');
      }
    }
    if (userID && roomID && role) {
      createClassRoom();
    }
  }, [dispatch, userID, roomID, role]);

  // 打开麦克风、扬声器选择Popup
  const onOpenMicSpeakerSelectPopup = (anchorBounds: DOMRect) => {
    logger.debug(
      `${logPrefix}onOpenMicSpeakerSelectPopup anchorBounds:`,
      anchorBounds
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_OPEN_MIC_SPEAKER_SELECT_POPUP,
      {
        anchorBounds: JSON.parse(JSON.stringify(anchorBounds)), // DOMRect 不支持序列化，需要转为普通对象
        eventSource: EEventSource.ClassRoomWindow,
      }
    );
  };

  // 更新本地麦克风状态
  const updateMicMuteState = (mute: boolean) => {
    tuiRoomCore.muteLocalMicrophone(mute);
    dispatch(
      updateDeviceState({
        isMicMuted: mute,
      })
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
      {
        isMicMuted: mute,
      }
    );
  };

  // 更新本地摄像头状态
  const updateCameraState = (started: boolean) => {
    dispatch(
      updateDeviceState({
        isCameraStarted: started,
      })
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
      {
        isCameraStarted: started,
      }
    );
  };

  const onOpenCameraSelectPopup = (anchorBounds: DOMRect) => {
    logger.debug(
      `${logPrefix}onOpenCameraSelectPopup anchorBounds:`,
      anchorBounds
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_OPEN_CAMERA_SELECT_POPUP,
      {
        anchorBounds: JSON.parse(JSON.stringify(anchorBounds)), // DOMRect 不支持序列化，需要转为普通对象
        eventSource: EEventSource.ClassRoomWindow,
      }
    );
  };

  // 更新白板分享的尺寸大小，由白板组件内部触发
  const onUpdateWhiteboardBoards = (boundsRect: DOMRect) => {
    logger.log(`${logPrefix}.onUpdateWhiteboardBoards boundsRect:`, boundsRect);
    setWhiteboardBound(boundsRect);
  };

  // 进入白板分享模式
  const enterWhiteboardMode = useCallback(() => {
    logger.debug(`${logPrefix}enterWhiteboardMode`);
    // 将窗口模式、右侧视频列表展示模式设为默认值
    setWindowMode(EWindowMode.Whiteboard);
    setVideoListWindowMode(EWindowSizeMode.Maximize);

    startShareWhiteBoard();
  }, [startShareWhiteBoard]);

  // 进入屏幕分享模式
  const enterScreenShareMode = (
    event: any,
    screenOrWindowInfo: Record<string, any>
  ) => {
    logger.debug(`${logPrefix}enterScreenShareMode`, screenOrWindowInfo);
    setWindowMode(EWindowMode.ScreenShare);
    if (screenOrWindowInfo?.sourceId) {
      const selectRect = new Rect();
      const screenShareEncParam = new TRTCVideoEncParam(
        TRTCVideoResolution.TRTCVideoResolution_1920_1080,
        TRTCVideoResolutionMode.TRTCVideoResolutionModeLandscape,
        15,
        1600,
        0,
        true
      );
      tuiRoomCore.selectScreenCaptureTarget(
        screenOrWindowInfo.type,
        screenOrWindowInfo.sourceId,
        screenOrWindowInfo.sourceName,
        selectRect,
        true, // mouse
        true // highlight
      );
      tuiRoomCore.startScreenCapture(null, screenShareEncParam);
    }

    // // 通知主进程调整窗口模式
    // (window as any).electron.ipcRenderer.send('enterScreenShareMode');
  };

  // 注册进入屏幕分享事件处理函数
  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_START_SHARE_SCREEN_WINDOW,
      enterScreenShareMode
    );

    return () => {
      (window as any).electron.ipcRenderer.removeListener(
        EUserEventNames.ON_START_SHARE_SCREEN_WINDOW,
        enterScreenShareMode
      );
    };
  }, []);

  // 注册退回白板分享事件处理函数
  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      EUserEventNames.ON_STOP_SHARE_SCREEN_WINDOW,
      enterWhiteboardMode
    );

    return () => {
      (window as any).electron.ipcRenderer.removeListener(
        EUserEventNames.ON_STOP_SHARE_SCREEN_WINDOW,
        enterWhiteboardMode
      );
    };
  }, [enterWhiteboardMode]);

  // 屏幕分享，首选需要打开屏幕、窗口选择弹框，选择要分享的内容
  const onStartSharing = () => {
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_SELECT_SHARE_SCREEN_WINDOW,
      {}
    );
  };

  // 屏幕分享模式下，收起视频列表窗口
  const collapseVideoListWindow = () => {
    setVideoListWindowMode(EWindowSizeMode.Minimize);
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_VIDEO_LIST_WINDOW_MODE,
      {
        mode: EWindowSizeMode.Minimize,
      }
    );
  };

  // 屏幕分享模式下，展开视频列表窗口
  const expandVideoListWindow = () => {
    setVideoListWindowMode(EWindowSizeMode.Maximize);
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_VIDEO_LIST_WINDOW_MODE,
      {
        mode: EWindowSizeMode.Maximize,
      }
    );
  };

  // 全员禁麦
  const muteAllStudent = useCallback(async () => {
    try {
      await tuiRoomCore.muteAllUsersMicrophone(!isAllStudentMuted);
      dispatch(updateAllStudentMuteState(!isAllStudentMuted));
      dispatch(updateIsAllMicrophoneMuted(!isAllStudentMuted));
      (window as any).electron.ipcRenderer.send(
        EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
        {
          isAllStudentMuted: !isAllStudentMuted,
        }
      );
    } catch (error) {
      logger.error(`${logPrefix}.muteAllStudent error`, error);
    }
  }, [isAllStudentMuted, dispatch]);

  // 发起点名
  const callAllStudent = useCallback(async () => {
    try {
      const currentTime = new Date().getTime();
      (window as any).electron.ipcRenderer.send(
        EUserEventNames.ON_CALL_ROLL,
        currentTime
      );
      logger.log(`${logPrefix}.callAllStudent:`, isRolled);
      if (!isRolled) {
        await tuiRoomCore.startCallingRoll();
        dispatch(updateRollState(true));
        Toast.info('开始点名！', 1000);
      } else {
        await tuiRoomCore.stopCallingRoll();
        dispatch(updateRollState(false));
        Toast.info('结束点名！', 1000);
      }
      (window as any).electron.ipcRenderer.send(
        EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
        {
          isRolled: !isRolled,
        }
      );
    } catch (error) {
      logger.error(`${logPrefix}.callAllStudent error`, error);
    }
  }, [isRolled, dispatch]);

  // 处理学生举手事件
  const onHandsUpHandler = (args: Record<string, any>) => {
    const studentID = args.data as string;
    const newHandsList = handsList.concat(studentID);
    setHandsList([...newHandsList]);
  };

  // 处理老师超时未处理学生举手
  const onHandsUpTimeOut = (args: Record<string, any>) => {
    logger.warn(`${logPrefix}onHandsUpTimeOut event:`, args);
    const studentID = args.data as string;
    // 老师若超时响应学生，则举手列表里面去除对应学生的名字
    const index = handsList.indexOf(studentID);
    if (index !== -1) {
      handsList.splice(index, 1);
      setHandsList([...handsList]);
    }
  };

  // 注册学生举手事件监听
  useEffect(() => {
    tuiRoomCore.on(ETUIRoomEvents.onReceiveSpeechApplication, onHandsUpHandler);
    tuiRoomCore.on(ETUIRoomEvents.onSpeechApplicationTimeout, onHandsUpTimeOut);

    return () => {
      tuiRoomCore.off(
        ETUIRoomEvents.onReceiveSpeechApplication,
        onHandsUpHandler
      );
      tuiRoomCore.off(
        ETUIRoomEvents.onSpeechApplicationTimeout,
        onHandsUpTimeOut
      );
    };
  });

  // 响应学生举手申请
  const confirmHandsUp = (studentID: any) => {
    logger.warn(`${logPrefix}.confirmHandsUp studentID:`, studentID);
    tuiRoomCore.replySpeechApplication(studentID, true);
    // 将选中的学生从举手列表里面删除
    const index = handsList.indexOf(studentID);
    if (index !== -1) {
      handsList.splice(index, 1);
      setHandsList([...handsList]);
    }
  };

  // 关闭举手列表窗口
  const onHandsUpPopClose = () => {
    // 剩余学生拒绝邀请
    handsList.forEach((val) => {
      tuiRoomCore.replySpeechApplication(val, false);
    });
    setHandsList([]);
  };

  // 老师通过视频列表图标按钮，主动打开/关闭学生或者自己的麦克风
  const toggleMicMuteState = (user: Record<string, any>) => {
    if (user.userID === currentUser.userID) {
      // 老师开关自己的麦克风
      updateMicMuteState(!currentUser.isMicMuted);
    } else {
      // 老师开关学生的麦克风
      // 远端 user.isMicMuted 为 false 时需要 mute 掉，否则，unmute
      const index = speechInvitationList.indexOf(user.userID);
      if (user.isMicMuted) {
        if (index === -1) {
          const userList = speechInvitationList;
          setSpeechInvitationList([...userList, user.userID]);
          tuiRoomCore
            .sendSpeechInvitation(user.userID)
            .then((tuiResponse) => {
              logger.log(
                `${logPrefix}.sendSpeechInvitation tuiResponse`,
                tuiResponse
              );
              switch (tuiResponse?.code) {
                case ETUISignalStatus.ACCEPTED:
                  Toast.info(`${tuiResponse?.data?.inviterID}接受上台`, 1000);
                  break;
                case ETUISignalStatus.REJECTED:
                  Toast.info(`${tuiResponse?.data?.inviterID}拒绝上台`, 1000);
                  break;
                case ETUISignalStatus.CANCELLED:
                  Toast.info(
                    `您已取消邀请${tuiResponse?.data?.inviterID}上台`,
                    1000
                  );
                  break;
                case ETUISignalStatus.TIMEOUT:
                  Toast.info(
                    `${tuiResponse?.data?.inviterID}上台超时，未接受`,
                    1000
                  );
                  break;
                default:
                  logger.log(
                    `${logPrefix}.sendSpeechInvitation tuiResponse ignore`
                  );
                  break;
              }
              userList.splice(index, 1);
              setSpeechInvitationList(userList);
              return null;
            })
            .catch((tuiError) => {
              logger.log(
                `${logPrefix}.sendSpeechInvitation tuiError`,
                tuiError
              );
            });
        } else if (index > -1) {
          const userList = speechInvitationList;
          userList.splice(index, 1);
          setSpeechInvitationList(userList);
          tuiRoomCore.cancelSpeechInvitation(user.userID);
        }
      } else {
        // 老师强制关闭学生麦克风
        tuiRoomCore.muteUserMicrophone(user.userID, true);
      }
    }
  };

  const classMemberList = Object.values(userMap) as Record<string, any>[];
  logger.log(`${logPrefix}.classMemberList:`, classMemberList);

  return (
    <div className="trtc-class-room">
      <header className="class-room-header">
        {windowMode === EWindowMode.Whiteboard ? (
          <TitleBar
            className="trtc-edu-full-title-bar"
            classStartTime={startTime}
            teacherID={currentUser.userID}
            roomID={currentUser.roomID}
          />
        ) : (
          <div className="trtc-edu-mini-title-bar">
            <Button onClick={collapseVideoListWindow}>
              <MinimizeIcon />
            </Button>
            <Button onClick={expandVideoListWindow}>
              <MaximizeIcon />
            </Button>
          </div>
        )}
      </header>
      <div className="class-room-body">
        <div
          className="main-content whiteboard-mode"
          hidden={windowMode === EWindowMode.ScreenShare}
        >
          <div className="white-board">
            <WhiteboardPanel
              user={currentUser}
              onUpdateBounds={onUpdateWhiteboardBoards}
            />
          </div>
          <div className="class-room-footer">
            <Toolbar
              role={currentUser.role}
              onChangeSharing={onStartSharing}
              isCameraStarted={currentUser.isCameraStarted}
              cameraList={cameraList}
              currentCameraID={currentUser.currentCamera?.deviceId || ''}
              updateCameraState={updateCameraState}
              onOpenCameraSelectPopup={onOpenCameraSelectPopup}
              isMicMute={currentUser.isMicMuted}
              microphoneList={microphoneList}
              currentMicId={currentUser.currentMic?.deviceId || ''}
              updateMicMuteState={updateMicMuteState}
              speakerList={speakerList}
              currentSpeakerID={currentUser.currentSpeaker?.deviceId || ''}
              onOpenMicSpeakerSelectPopup={onOpenMicSpeakerSelectPopup}
              isAllStudentMuted={isAllStudentMuted}
              onMuteAllStudent={muteAllStudent}
              onCallAllStudent={callAllStudent}
              handsUpList={handsList}
              handsUpHandler={confirmHandsUp}
              onHandsUpPopClose={onHandsUpPopClose}
              isRolled={isRolled}
            />
          </div>
        </div>
        {windowMode === EWindowMode.Whiteboard && (
          <aside className="aside-content">
            <AsidePanel
              currentUser={currentUser}
              teacherID={currentUser.userID}
              toggleMicMuteState={toggleMicMuteState}
              classMembers={classMemberList}
              messageList={messageList}
              sendChatMessage={sendChatMessage}
            />
          </aside>
        )}
        {windowMode === EWindowMode.ScreenShare && (
          <div
            className="main-content screen-share-mode"
            hidden={videoListWindowMode === EWindowSizeMode.Minimize}
          >
            <AsideCameraVideoList
              classMemberList={classMemberList}
              toggleMicMuteState={toggleMicMuteState}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
