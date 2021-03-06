import a18n from 'a18n';
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
import DeviceDetector from '../../../components/class-device-detector';
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
import useTUIRoomErrorWarning from '../../../hooks/use-tuiroom-error-warning';
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
  const [isDeviceTestFinished, setIsDeviceTestFinished] =
    useState<boolean>(false);

  useTUIRoomErrorWarning();
  useDevice();
  useClassMember();
  const { sendChatMessage } = useMessageList();
  const { setWhiteboardBound, startShareWhiteBoard } = useWhiteboard({ windowMode }); // eslint-disable-line
  useTopToolbarEvent();

  const currentUser = useSelector((state: any) => state.user);
  const chatNumber = useSelector((state: any) => state.user.chatNumber);
  const roomInfo = useSelector((state: any) => state.roomInfo);
  const cameraList = useSelector((state: any) => state.device.cameraList);
  const microphoneList = useSelector((state: any) => state.device.microphoneList); // eslint-disable-line
  const speakerList = useSelector((state: any) => state.device.speakerList);
  const messageList = useSelector((state: any) => state.message.messages);
  const userMap = useSelector((state: any) => state.userMap.userMap);

  const dispatch = useDispatch();
  const { isAllStudentMuted, roomID, userID, role, isRolled } = currentUser;

  const { startTime } = roomInfo;

  // ????????????
  useEffect(() => {
    async function createClassRoom() {
      logger.debug(
        `${logPrefix}createClassRoom enter userID: ${userID} role: ${role} roomID: ${roomID}`
      );
      try {
        const { userSig, sdkAppId } = await (
          window as any
        ).electron.genTestUserSig(userID);
        if (role === 'teacher') {
          await tuiRoomCore.login(sdkAppId, userID, userSig);
          const tuiResponse = await tuiRoomCore.createRoom(roomID);
          dispatch(updateStartTime(tuiResponse.data.roomConfig.startTime));
          dispatch(updateOwnerID(tuiResponse.data.ownerID));
          logger.log(`${logPrefix}createClassRoom:`, tuiResponse);

          // ????????????
          tuiRoomCore.startMicrophone();

          // ???????????????????????????????????????
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
        (window as any).appMonitor?.reportEvent('CreateClassRoom', 'Success');
      } catch (error) {
        logger.error(`${logPrefix}createClassRoom error:`, error);
        Toast.error(a18n('??????????????????'));
        (window as any).appMonitor?.reportEvent('CreateClassRoom', 'Failed');
      }
    }
    if (userID && roomID && role && isDeviceTestFinished) {
      createClassRoom();
    }
  }, [dispatch, userID, roomID, role, isDeviceTestFinished]);

  // ?????????????????????????????????Popup
  const onOpenMicSpeakerSelectPopup = (anchorBounds: DOMRect) => {
    logger.debug(
      `${logPrefix}onOpenMicSpeakerSelectPopup anchorBounds:`,
      anchorBounds
    );
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_OPEN_MIC_SPEAKER_SELECT_POPUP,
      {
        anchorBounds: JSON.parse(JSON.stringify(anchorBounds)), // DOMRect ?????????????????????????????????????????????
        eventSource: EEventSource.ClassRoomWindow,
      }
    );
    (window as any).appMonitor?.reportEvent('OpenMicSpeakerPopup');
  };

  // ???????????????????????????
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

  // ???????????????????????????
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
        anchorBounds: JSON.parse(JSON.stringify(anchorBounds)), // DOMRect ?????????????????????????????????????????????
        eventSource: EEventSource.ClassRoomWindow,
      }
    );
    (window as any).appMonitor?.reportEvent('OpenCameraPopup');
  };

  // ???????????????????????????????????????????????????????????????
  const onUpdateWhiteboardBoards = (boundsRect: DOMRect) => {
    logger.log(`${logPrefix}.onUpdateWhiteboardBoards boundsRect:`, boundsRect);
    setWhiteboardBound(boundsRect);
  };

  // ????????????????????????
  const enterWhiteboardMode = useCallback(() => {
    logger.debug(`${logPrefix}enterWhiteboardMode`);
    // ???????????????????????????????????????????????????????????????
    setWindowMode(EWindowMode.Whiteboard);
    setVideoListWindowMode(EWindowSizeMode.Maximize);

    startShareWhiteBoard();
  }, [startShareWhiteBoard]);

  // ????????????????????????
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
    (window as any).appMonitor?.reportEvent('ShareScreen');
  };

  // ??????????????????????????????????????????
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

  // ??????????????????????????????????????????
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

  // ???????????????????????????????????????????????????????????????????????????????????????
  const onStartSharing = () => {
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_SELECT_SHARE_SCREEN_WINDOW,
      {}
    );
  };

  // ????????????????????????????????????????????????
  const collapseVideoListWindow = () => {
    setVideoListWindowMode(EWindowSizeMode.Minimize);
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_VIDEO_LIST_WINDOW_MODE,
      {
        mode: EWindowSizeMode.Minimize,
      }
    );
  };

  // ????????????????????????????????????????????????
  const expandVideoListWindow = () => {
    setVideoListWindowMode(EWindowSizeMode.Maximize);
    (window as any).electron.ipcRenderer.send(
      EUserEventNames.ON_CHANGE_VIDEO_LIST_WINDOW_MODE,
      {
        mode: EWindowSizeMode.Maximize,
      }
    );
  };

  // ????????????
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
    (window as any).appMonitor?.reportEvent('MuteAll');
  }, [isAllStudentMuted, dispatch]);

  // ????????????
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
        Toast.info(a18n('???????????????'), 1000);
      } else {
        await tuiRoomCore.stopCallingRoll();
        dispatch(updateRollState(false));
        Toast.info(a18n('???????????????'), 1000);
      }
      (window as any).appMonitor?.reportEvent('CallRoll');
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

  // ????????????????????????
  const onHandsUpHandler = (args: Record<string, any>) => {
    const studentID = args.data as string;
    const newHandsList = handsList.concat(studentID);
    setHandsList([...newHandsList]);
  };

  // ???????????????????????????????????????
  const onHandsUpTimeOut = (args: Record<string, any>) => {
    logger.warn(`${logPrefix}onHandsUpTimeOut event:`, args);
    const studentID = args.data as string;
    // ??????????????????????????????????????????????????????????????????????????????
    const index = handsList.indexOf(studentID);
    if (index !== -1) {
      handsList.splice(index, 1);
      setHandsList([...handsList]);
    }
  };

  // ??????????????????????????????
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

  // ????????????????????????
  const confirmHandsUp = (studentID: any) => {
    logger.warn(`${logPrefix}.confirmHandsUp studentID:`, studentID);
    tuiRoomCore.replySpeechApplication(studentID, true);
    // ?????????????????????????????????????????????
    const index = handsList.indexOf(studentID);
    if (index !== -1) {
      handsList.splice(index, 1);
      setHandsList([...handsList]);
    }
  };

  // ????????????????????????
  const onHandsUpPopClose = () => {
    // ????????????????????????
    handsList.forEach((val) => {
      tuiRoomCore.replySpeechApplication(val, false);
    });
    setHandsList([]);
  };

  // ???????????????????????????????????????????????????/????????????????????????????????????
  const toggleMicMuteState = (user: Record<string, any>) => {
    if (user.userID === currentUser.userID) {
      // ??????????????????????????????
      updateMicMuteState(!currentUser.isMicMuted);
    } else {
      // ??????????????????????????????
      // ?????? user.isMicMuted ??? false ????????? mute ???????????????unmute
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
                  Toast.info(
                    a18n`${tuiResponse?.data?.inviterID}????????????`,
                    1000
                  );
                  break;
                case ETUISignalStatus.REJECTED:
                  Toast.info(
                    a18n`${tuiResponse?.data?.inviterID}????????????`,
                    1000
                  );
                  break;
                case ETUISignalStatus.CANCELLED:
                  Toast.info(
                    a18n`??????????????????${tuiResponse?.data?.inviterID}??????`,
                    1000
                  );
                  break;
                case ETUISignalStatus.TIMEOUT:
                  Toast.info(
                    a18n`${tuiResponse?.data?.inviterID}????????????????????????`,
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
        // ?????????????????????????????????
        tuiRoomCore.muteUserMicrophone(user.userID, true);
      }
      (window as any).appMonitor?.reportEvent('MuteStudent');
    }
  };

  const onCloseDeviceTest = () => {
    setIsDeviceTestFinished(true);
  };
  const onFinishDeviceTest = (finishDeviceTest: boolean) => {
    setIsDeviceTestFinished(finishDeviceTest);
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
            chatNumber={chatNumber}
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
      <DeviceDetector
        visible
        onClose={onCloseDeviceTest}
        audioUrl=""
        hasNetworkDetect={false}
        networkDetectInfo={{}}
        onFinishDeviceTest={onFinishDeviceTest}
      />
    </div>
  );
}

export default HomePage;
