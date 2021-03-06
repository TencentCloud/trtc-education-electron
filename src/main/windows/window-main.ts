import { ipcMain, systemPreferences } from 'electron';
import { EUserEventNames } from '../../constants';
import Logger, { setLogLevel } from '../logger';
import { createWindow } from '../create-window';
import BaseWindow from './window-base';
import ClassRoomWindow, {
  createTeacherClassRoomWindow,
  createStudentClassRoomWindow,
} from './window-class-room';
import TopToolbarWindow, { createTopToolbarWindow } from './window-top-toolbar';
import ShareScreenSelectWindow, {
  createShareScreenSelectWindow,
} from './window-share-screen-select';
import PopupWindow, { createPopupWindow, popupConstant } from './window-popup';
import store, { clearStore } from '../store';
import { EEventSource } from '../../types';

class MainWindow extends BaseWindow {
  private static preLog = '[MainWindow]';

  private teacherClassRoomWindow!: ClassRoomWindow | null;

  private studentClassRoomWindow!: ClassRoomWindow | null;

  private shareScreenSelectWindow!: ShareScreenSelectWindow | null;

  private topToolbarWindow!: TopToolbarWindow | null;

  private popupWindow!: PopupWindow | null;

  constructor(options: Record<string, unknown>, url: string, initData: any) {
    super(options, url, initData);
    // App event handler
    this.onTeacherEnterClassRoom = this.onTeacherEnterClassRoom.bind(this);
    this.onTeacherExitClassRoom = this.onTeacherExitClassRoom.bind(this);
    this.onStudentEnterClassRoom = this.onStudentEnterClassRoom.bind(this);
    this.onStudentExitClassRoom = this.onStudentExitClassRoom.bind(this);
    this.onChangeLocalUserState = this.onChangeLocalUserState.bind(this);
    this.onChangeLogLevel = this.onChangeLogLevel.bind(this);
    this.onChooseShareScreenWindow = this.onChooseShareScreenWindow.bind(this);
    this.onConfirmShareScreenWindow = this.onConfirmShareScreenWindow.bind(this); // eslint-disable-line
    this.onCancelShareScreenWindow = this.onCancelShareScreenWindow.bind(this);
    this.onFinishShareScreenWindow = this.onFinishShareScreenWindow.bind(this);
    this.onUpdateCameraStateFromTopToolbar = this.onUpdateCameraStateFromTopToolbar.bind(this); // eslint-disable-line
    this.onUpdateMicStateFromTopToolbar = this.onUpdateMicStateFromTopToolbar.bind(this); // eslint-disable-line
    this.onUpdateAllMicStateFromTopToolbar = this.onUpdateAllMicStateFromTopToolbar.bind(this); // eslint-disable-line
    this.onInitDevice = this.onInitDevice.bind(this);
    this.onOpenCameraSelectPopup = this.onOpenCameraSelectPopup.bind(this);
    this.onChangeCurrentCamera = this.onChangeCurrentCamera.bind(this);
    this.onOpenMicSpeakerSelectPopup = this.onOpenMicSpeakerSelectPopup.bind(this); // eslint-disable-line
    this.onChangeCurrentMicrophone = this.onChangeCurrentMicrophone.bind(this);
    this.onChangeCurrentSpeaker = this.onChangeCurrentSpeaker.bind(this);
    this.onUpdateCallRollStateFromTopToolbar = this.onUpdateCallRollStateFromTopToolbar.bind(this); // eslint-disable-line

    // TIM event handler
    this.onMessageReceived = this.onMessageReceived.bind(this);

    this.destroy = this.destroy.bind(this);
  }

  async init() {
    this.browserWindow = await createWindow(
      this.windowOptions || {},
      this.contentUrl || '',
      this.initData
    );

    // logger ???????????????
    this.logger = new Logger(this.browserWindow);

    this.registerEvent();
    this.browserWindow.on('closed', this.destroy);
  }

  private async checkAndApplyDevicePrivilege() {
    const cameraPrivilege = systemPreferences.getMediaAccessStatus('camera');
    this.logger?.debug(
      `${MainWindow.preLog}checkAndApplyDevicePrivilege before apply cameraPrivilege: ${cameraPrivilege}`
    );
    if (cameraPrivilege !== 'granted') {
      await systemPreferences.askForMediaAccess('camera');
    }

    const micPrivilege = systemPreferences.getMediaAccessStatus('microphone');
    this.logger?.debug(
      `${MainWindow.preLog}checkAndApplyDevicePrivilege before apply micPrivilege: ${micPrivilege}`
    );
    if (micPrivilege !== 'granted') {
      await systemPreferences.askForMediaAccess('microphone');
    }

    const screenPrivilege = systemPreferences.getMediaAccessStatus('screen');
    this.logger?.debug(
      `${MainWindow.preLog}checkAndApplyDevicePrivilege before apply screenPrivilege: ${screenPrivilege}`
    );
  }

  // ??????????????????
  async onTeacherEnterClassRoom(event: any, args: any): Promise<boolean> {
    this.logger?.log(
      `${MainWindow.preLog}.onTeacherEnterClassRoom() args:`,
      args
    );
    try {
      await this.checkAndApplyDevicePrivilege();
      if (this.teacherClassRoomWindow) {
        return false; // ??????????????????????????????????????????
      }
      store.currentUser = Object.assign(store.currentUser, args);
      this.teacherClassRoomWindow = await createTeacherClassRoomWindow({
        currentUser: store.currentUser,
        windowBaseInfoMap: store.windowBaseInfoMap,
      });
      this.browserWindow?.hide();

      // ?????????????????????????????????????????????????????????????????????????????????????????????
      this.shareScreenSelectWindow = await createShareScreenSelectWindow({
        ...store,
        afterLoadConfig: {
          show: false,
          focus: false,
        },
      });

      return true;
    } catch (error) {
      console.error(
        `${MainWindow.logPrefix}onTeacherEnterClassRoom error:`,
        error
      );
      this.logger?.error(
        `${MainWindow.logPrefix}onTeacherEnterClassRoom error.`
      );
      throw error;
    }
  }

  // ??????????????????
  async onStudentEnterClassRoom(event: any, args: any): Promise<boolean> {
    this.logger?.log(
      `${MainWindow.preLog}.onStudentEnterClassRoom() args:`,
      args
    );
    try {
      await this.checkAndApplyDevicePrivilege();
      if (this.studentClassRoomWindow) {
        return false; // ??????????????????????????????????????????
      }
      store.currentUser = Object.assign(store.currentUser, args);
      this.studentClassRoomWindow = await createStudentClassRoomWindow({
        currentUser: store.currentUser,
        windowBaseInfoMap: store.windowBaseInfoMap,
      });
      this.browserWindow?.hide();
      return true;
    } catch (error) {
      console.error(
        `${MainWindow.logPrefix}onStudentEnterClassRoom error:`,
        error
      );
      this.logger?.error(
        `${MainWindow.logPrefix}onStudentEnterClassRoom error.`
      );
      throw error;
    }
  }

  // ??????????????????????????????
  onTeacherExitClassRoom(event: any, args: any) {
    this.logger?.log(
      `${MainWindow.preLog}.exitClassRoomListener() args:`,
      args
    );
    this.browserWindow?.show();

    this.teacherClassRoomWindow?.close();
    this.teacherClassRoomWindow = null;

    this.shareScreenSelectWindow?.close();
    this.shareScreenSelectWindow = null;

    this.topToolbarWindow?.close();
    this.topToolbarWindow = null;

    this.popupWindow?.close();
    this.popupWindow = null;

    // clear store
    clearStore();
  }

  // ??????????????????
  onStudentExitClassRoom(event: any, args: any) {
    this.logger?.log(
      `${MainWindow.preLog}.onStudentExitClassRoom() args:`,
      args
    );
    this.browserWindow?.show();
    this.studentClassRoomWindow?.close();
    this.studentClassRoomWindow = null;

    // clear store
    clearStore();
  }

  // ??????????????????
  onMessageReceived(event: any, args: any) {
    this.logger?.log(`${MainWindow.preLog}.onMessageReceived() args:`, args);

    const receivedMessage = args as Array<never>;
    receivedMessage.forEach((item) => store.messages.push(item));
  }

  // ????????????????????????
  onChangeLocalUserState(event: any, args: any) {
    this.logger?.log(
      `${MainWindow.preLog}.onChangeLocalUserState() args:`,
      args
    );

    store.currentUser = Object.assign(store.currentUser, args);
  }

  // ????????????????????????
  // eslint-disable-next-line class-methods-use-this
  onChangeLogLevel(event: any, newlogLevel: number) {
    setLogLevel(newlogLevel);
  }

  // ????????????????????????????????????????????????????????????????????????
  async onChooseShareScreenWindow(event: any) {
    this.logger?.log(`${MainWindow.preLog}onChooseShareScreenWindow`);
    if (this.shareScreenSelectWindow) {
      this.shareScreenSelectWindow.show();
      this.shareScreenSelectWindow.send(EUserEventNames.ON_INIT_DATA, store);
    } else {
      this.logger?.error(
        `${MainWindow.logPrefix}onChooseShareScreenWindow pre-create shareScreenSelectWindow failed`
      );
    }
  }

  // ????????????????????????????????????????????????????????????
  async onConfirmShareScreenWindow(event: any, args: any) {
    this.logger?.log(
      `${MainWindow.logPrefix}onConfirmShareScreenWindow args:`,
      args
    );
    const screenSource = args;
    store.currentUser.sharingScreenInfo = {
      type: screenSource.type,
      sourceId: screenSource.sourceId,
      sourceName: screenSource.sourceName,
    };

    // ??????????????????????????????
    if (this.shareScreenSelectWindow) {
      this.shareScreenSelectWindow.hide();
    } else {
      this.logger?.error(
        `${MainWindow.preLog}.onConfirmShareScreenWindow hide window failed`
      );
    }

    // ???????????????????????????????????????????????????
    if (!this.topToolbarWindow) {
      this.topToolbarWindow = await createTopToolbarWindow(store);
    } else {
      this.topToolbarWindow.send(EUserEventNames.ON_INIT_DATA, store);
      this.topToolbarWindow.show();
    }

    // ???????????????????????????????????????????????????????????????
    if (this.teacherClassRoomWindow) {
      this.teacherClassRoomWindow.send(
        EUserEventNames.ON_START_SHARE_SCREEN_WINDOW,
        store.currentUser.sharingScreenInfo
      );
      this.teacherClassRoomWindow.enterScreenShareMode();
    }
  }

  // ????????????????????????????????????????????????????????????
  onCancelShareScreenWindow(event: any, args: any) {
    this.logger?.log(`${MainWindow.preLog}onCancelShareScreenWindow`);
    if (this.shareScreenSelectWindow) {
      this.shareScreenSelectWindow.hide();
    } else {
      this.logger?.error(
        `${MainWindow.preLog}.onCancelShareScreenWindow hide window failed`
      );
    }
  }

  // ????????????????????????????????????
  onFinishShareScreenWindow(event: any, args: any) {
    this.logger?.log(
      `${MainWindow.logPrefix}onFinishShareScreenWindow args:`,
      args
    );

    if (this.topToolbarWindow) {
      this.topToolbarWindow.send(
        EUserEventNames.ON_STOP_SHARE_SCREEN_WINDOW,
        null
      );
      this.topToolbarWindow.hide();
    }

    if (this.teacherClassRoomWindow) {
      this.teacherClassRoomWindow.send(
        EUserEventNames.ON_STOP_SHARE_SCREEN_WINDOW,
        null
      );
      this.teacherClassRoomWindow.enterWhiteboardMode();
    }
  }

  // ???????????????????????????????????????????????????
  onUpdateCameraStateFromTopToolbar(
    event: any,
    args: {
      isCameraStarted: boolean;
    }
  ) {
    const { isCameraStarted } = args;
    store.currentUser.isCameraStarted = isCameraStarted;
    this.teacherClassRoomWindow?.send(
      EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
      {
        isCameraStarted,
      }
    );
  }

  // ???????????????????????????????????????????????????
  onUpdateMicStateFromTopToolbar(
    event: any,
    args: {
      isMicMuted: boolean;
    }
  ) {
    const { isMicMuted } = args;
    store.currentUser.isMicMuted = isMicMuted;
    this.teacherClassRoomWindow?.send(
      EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
      {
        isMicMuted,
      }
    );
  }

  // ????????????????????????????????????????????????
  onUpdateAllMicStateFromTopToolbar(
    event: any,
    args: {
      isAllStudentMuted: boolean;
    }
  ) {
    const { isAllStudentMuted } = args;
    store.currentUser.isAllStudentMuted = isAllStudentMuted;
    this.teacherClassRoomWindow?.send(
      EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
      {
        isAllStudentMuted,
      }
    );
  }

  // ??????????????????????????????????????????
  onUpdateCallRollStateFromTopToolbar(
    event: any,
    args: {
      isRolled: boolean;
    }
  ) {
    const { isRolled } = args;
    store.currentUser.isRolled = isRolled;
    this.teacherClassRoomWindow?.send(
      EUserEventNames.ON_CHANGE_LOCAL_USER_STATE,
      {
        isRolled,
      }
    );
  }

  // ??????????????????????????????????????????????????????
  async onOpenCameraSelectPopup(event: any, args: Record<string, any>) {
    this.logger?.log(`${MainWindow.preLog}onOpenCameraSelectPopup args:`, args);
    try {
      const { anchorBounds, eventSource } = args;
      const { cameraList } = store.device;
      if (!this.popupWindow) {
        this.popupWindow = await createPopupWindow({});
      }
      this.popupWindow.hide();

      const listTitleCount = 1;
      let x = 0;
      let y = 0;
      const popWidth = 300;
      let popHeight = 0;
      if (eventSource === EEventSource.TopToolbarWindow) {
        // ????????????????????????????????????????????????
        const topToolbarWindowBounds = this.topToolbarWindow?.getBounds();
        if (topToolbarWindowBounds) {
          x =
            topToolbarWindowBounds.x +
            anchorBounds.left +
            anchorBounds.width / 2 -
            popWidth / 2;
          y =
            topToolbarWindowBounds.y +
            topToolbarWindowBounds.height -
            popupConstant.INDENT_DISTANCE_TO_ICON;
          popHeight =
            (cameraList.length + listTitleCount) * popupConstant.ITEM_HEIGHT +
            popupConstant.MARGIN_TOP +
            popupConstant.MARGIN_BOTTOM +
            popupConstant.BORDER_WIDTH * 2;
        }
      } else {
        // ????????????????????????????????????????????????
        const classRoomWindowBounds = this.teacherClassRoomWindow?.getBounds();
        if (classRoomWindowBounds) {
          x =
            classRoomWindowBounds.x +
            anchorBounds.left +
            anchorBounds.width / 2 -
            popWidth / 2;
          popHeight =
            (cameraList.length + listTitleCount) * popupConstant.ITEM_HEIGHT +
            popupConstant.MARGIN_TOP +
            popupConstant.MARGIN_BOTTOM +
            popupConstant.BORDER_WIDTH * 2;
          y =
            classRoomWindowBounds.y +
            anchorBounds.top +
            popupConstant.INDENT_DISTANCE_TO_ICON -
            popHeight;
        }
      }
      this.popupWindow.position({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(popWidth),
        height: Math.round(popHeight),
      });
      await this.popupWindow.loadPage('index.html?view=camera-selector', {
        currentCamera: store.currentUser.currentCamera,
        cameraList,
        eventSource,
      });
      this.popupWindow.show();
    } catch (error: any) {
      console.error(
        `${MainWindow.logPrefix}onOpenCameraSelectPopup error`,
        error
      );
    }
  }

  // ???????????????????????????
  onChangeCurrentCamera(event: any, args: Record<string, any>) {
    this.logger?.log(`${MainWindow.preLog}onChangeCurrentCamera args:`, args);
    const { currentCamera: newCameraDevice } = args;
    if (
      newCameraDevice.deviceId !== store.currentUser.currentCamera?.deviceId
    ) {
      store.currentUser.currentCamera = newCameraDevice;
      this.teacherClassRoomWindow?.send(
        EUserEventNames.ON_CHANGE_CURRENT_CAMERA,
        newCameraDevice
      );
    }

    this.popupWindow?.hide();
  }

  // ??????????????????????????????????????????????????????????????????
  async onOpenMicSpeakerSelectPopup(event: any, args: Record<string, any>) {
    this.logger?.log(
      `${MainWindow.preLog}onOpenMicSpeakerSelectPopup args:`,
      args
    );
    try {
      const { anchorBounds, eventSource } = args;
      const { microphoneList, speakerList } = store.device;
      if (!this.popupWindow) {
        this.popupWindow = await createPopupWindow({});
      }
      this.popupWindow.hide();

      const listTitleCount = 2;
      let x = 0;
      let y = 0;
      const popWidth = 300;
      let popHeight = 0;
      if (eventSource === EEventSource.TopToolbarWindow) {
        // ????????????????????????????????????????????????
        const topToolbarWindowBounds = this.topToolbarWindow?.getBounds();
        if (topToolbarWindowBounds) {
          x =
            topToolbarWindowBounds.x +
            anchorBounds.left +
            anchorBounds.width / 2 -
            popWidth / 2;
          y =
            topToolbarWindowBounds.y +
            topToolbarWindowBounds.height -
            popupConstant.INDENT_DISTANCE_TO_ICON;
          popHeight =
            (microphoneList.length + speakerList.length + listTitleCount) *
              popupConstant.ITEM_HEIGHT +
            popupConstant.MARGIN_TOP +
            popupConstant.MARGIN_BOTTOM +
            popupConstant.BORDER_WIDTH * 2;
        }
      } else {
        // ????????????????????????????????????????????????
        const classRoomWindowBounds = this.teacherClassRoomWindow?.getBounds();
        if (classRoomWindowBounds) {
          x =
            classRoomWindowBounds.x +
            anchorBounds.left +
            anchorBounds.width / 2 -
            popWidth / 2;
          popHeight =
            (microphoneList.length + speakerList.length + listTitleCount) *
              popupConstant.ITEM_HEIGHT +
            popupConstant.MARGIN_TOP +
            popupConstant.MARGIN_BOTTOM +
            popupConstant.BORDER_WIDTH * 2;
          y =
            classRoomWindowBounds.y +
            anchorBounds.top +
            popupConstant.INDENT_DISTANCE_TO_ICON -
            popHeight;
        }
      }

      this.popupWindow.position({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(popWidth),
        height: Math.round(popHeight),
      });
      await this.popupWindow.loadPage(
        'index.html?view=microphone-speaker-selector',
        {
          currentMicrophone: store.currentUser.currentMic,
          microphoneList,
          currentSpeaker: store.currentUser.currentSpeaker,
          speakerList,
          eventSource,
        }
      );
      this.popupWindow.show();
    } catch (error: any) {
      console.error(
        `${MainWindow.logPrefix}onOpenMicSpeakerSelectPopup error`,
        error
      );
    }
  }

  // ???????????????????????????
  onChangeCurrentMicrophone(event: any, args: Record<string, any>) {
    this.logger?.log(
      `${MainWindow.preLog}onChangeCurrentMicrophone args:`,
      args
    );
    const { currentMicrophone: newMicrophoneDevice } = args;
    if (
      newMicrophoneDevice.deviceId !== store.currentUser.currentMic?.deviceId
    ) {
      store.currentUser.currentMic = newMicrophoneDevice;
      this.teacherClassRoomWindow?.send(
        EUserEventNames.ON_CHANGE_CURRENT_MICROPHONE,
        newMicrophoneDevice
      );
    }

    this.popupWindow?.hide();
  }

  // ???????????????????????????
  onChangeCurrentSpeaker(event: any, args: Record<string, any>) {
    this.logger?.log(`${MainWindow.preLog}onChangeCurrentSpeaker args:`, args);
    const { currentSpeaker: newSpeakerDevice } = args;
    if (
      newSpeakerDevice.deviceId !== store.currentUser.currentSpeaker?.deviceId
    ) {
      store.currentUser.currentSpeaker = newSpeakerDevice;
      this.teacherClassRoomWindow?.send(
        EUserEventNames.ON_CHANGE_CURRENT_SPEAKER,
        newSpeakerDevice
      );
    }

    this.popupWindow?.hide();
  }

  // ?????????????????????????????????
  onInitDevice(event: any, args: Record<string, any>) {
    this.logger?.log(`${MainWindow.preLog}onInitDevice args:`, args);
    const { cameraList, microphoneList, speakerList } = args;
    store.device.cameraList = cameraList;
    store.device.microphoneList = microphoneList;
    store.device.speakerList = speakerList;
  }

  registerEvent() {
    // App event
    ipcMain.handle(EUserEventNames.ON_TEACHER_ENTER_CLASS_ROOM, this.onTeacherEnterClassRoom); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_TEACHER_EXIT_CLASS_ROOM, this.onTeacherExitClassRoom); // eslint-disable-line
    ipcMain.handle(EUserEventNames.ON_STUDENT_ENTER_CLASS_ROOM, this.onStudentEnterClassRoom); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_STUDENT_EXIT_CLASS_ROOM, this.onStudentExitClassRoom); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_CHANGE_LOCAL_USER_STATE, this.onChangeLocalUserState); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_CHANGE_LOG_LEVEL, this.onChangeLogLevel);
    ipcMain.on(EUserEventNames.ON_SELECT_SHARE_SCREEN_WINDOW, this.onChooseShareScreenWindow); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_CONFIRM_SHARE_SCREEN_WINDOW, this.onConfirmShareScreenWindow); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_CANCEL_SHARE_SCREEN_WINDOW, this.onCancelShareScreenWindow); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_STOP_SHARE_SCREEN_WINDOW, this.onFinishShareScreenWindow); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_UPDATE_CAMERA_STATE_FROM_TOP_TOOLBAR, this.onUpdateCameraStateFromTopToolbar); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_UPDATE_MIC_STATE_FROM_TOP_TOOLBAR, this.onUpdateMicStateFromTopToolbar); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_INIT_DEVICE, this.onInitDevice);
    ipcMain.on(EUserEventNames.ON_UPDATE_ALL_MIC_STATE_FROM_TOP_TOOLBAR, this.onUpdateAllMicStateFromTopToolbar); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_OPEN_CAMERA_SELECT_POPUP, this.onOpenCameraSelectPopup); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_CHANGE_CURRENT_CAMERA, this.onChangeCurrentCamera); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_OPEN_MIC_SPEAKER_SELECT_POPUP, this.onOpenMicSpeakerSelectPopup); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_CHANGE_CURRENT_MICROPHONE, this.onChangeCurrentMicrophone); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_CHANGE_CURRENT_SPEAKER, this.onChangeCurrentSpeaker); // eslint-disable-line
    ipcMain.on(EUserEventNames.ON_UPDATE_CALL_ROLL_STATE_FROM_TOP_TOOLBAR, this.onUpdateCallRollStateFromTopToolbar); // eslint-disable-line

    // TIM event
    ipcMain.on(EUserEventNames.ON_MESSAGE_RECEIVED, this.onMessageReceived);
  }

  unregisterEvent() {
    // App event
    ipcMain.removeHandler(EUserEventNames.ON_TEACHER_ENTER_CLASS_ROOM);
    ipcMain.removeListener(EUserEventNames.ON_TEACHER_EXIT_CLASS_ROOM, this.onTeacherExitClassRoom); // eslint-disable-line
    ipcMain.removeHandler(EUserEventNames.ON_STUDENT_ENTER_CLASS_ROOM);
    ipcMain.removeListener(EUserEventNames.ON_STUDENT_EXIT_CLASS_ROOM, this.onStudentExitClassRoom); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_CHANGE_LOCAL_USER_STATE, this.onChangeLocalUserState); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_CHANGE_LOG_LEVEL, this.onChangeLogLevel); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_SELECT_SHARE_SCREEN_WINDOW, this.onChooseShareScreenWindow); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_CONFIRM_SHARE_SCREEN_WINDOW, this.onConfirmShareScreenWindow); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_CANCEL_SHARE_SCREEN_WINDOW, this.onCancelShareScreenWindow); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_STOP_SHARE_SCREEN_WINDOW, this.onFinishShareScreenWindow); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_UPDATE_CAMERA_STATE_FROM_TOP_TOOLBAR, this.onUpdateCameraStateFromTopToolbar); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_UPDATE_MIC_STATE_FROM_TOP_TOOLBAR, this.onUpdateMicStateFromTopToolbar); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_INIT_DEVICE, this.onInitDevice);
    ipcMain.removeListener(EUserEventNames.ON_UPDATE_ALL_MIC_STATE_FROM_TOP_TOOLBAR, this.onUpdateAllMicStateFromTopToolbar); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_OPEN_CAMERA_SELECT_POPUP, this.onOpenCameraSelectPopup); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_CHANGE_CURRENT_CAMERA, this.onChangeCurrentCamera); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_OPEN_MIC_SPEAKER_SELECT_POPUP, this.onOpenMicSpeakerSelectPopup); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_CHANGE_CURRENT_MICROPHONE, this.onChangeCurrentMicrophone); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_CHANGE_CURRENT_SPEAKER, this.onChangeCurrentSpeaker); // eslint-disable-line
    ipcMain.removeListener(EUserEventNames.ON_UPDATE_CALL_ROLL_STATE_FROM_TOP_TOOLBAR, this.onUpdateCallRollStateFromTopToolbar); // eslint-disable-line

    // TIM event
    ipcMain.removeListener(EUserEventNames.ON_MESSAGE_RECEIVED, this.onMessageReceived); // eslint-disable-line
  }

  getBrowserWindow() {
    return this.browserWindow;
  }

  destroy() {
    this.unregisterEvent();
    super.destroy();
  }
}

export default MainWindow;

export async function createMainWindow(initData: any) {
  const LOGIN_WIDTH = 1100;
  const LOGIN_HEIGHT = 600;

  const mainWindowConfig = {
    width: LOGIN_WIDTH,
    height: LOGIN_HEIGHT,
  };
  const mainWindowUrl = 'index.html?view=home';
  const newWindow = new MainWindow(mainWindowConfig, mainWindowUrl, initData);
  await newWindow.init();
  return newWindow;
}
