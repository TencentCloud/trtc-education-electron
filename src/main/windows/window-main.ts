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

    // logger 从父类继承
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

  // 老师进入课堂
  async onTeacherEnterClassRoom(event: any, args: any): Promise<boolean> {
    this.logger?.log(
      `${MainWindow.preLog}.onTeacherEnterClassRoom() args:`,
      args
    );
    try {
      await this.checkAndApplyDevicePrivilege();
      if (this.teacherClassRoomWindow) {
        return false; // 防御按钮二次点击导致重复创建
      }
      store.currentUser = Object.assign(store.currentUser, args);
      this.teacherClassRoomWindow = await createTeacherClassRoomWindow({
        currentUser: store.currentUser,
        windowBaseInfoMap: store.windowBaseInfoMap,
      });
      this.browserWindow?.hide();

      // 提前创建屏幕分享选择窗口。只有老师可以分享屏幕，所以在此处创建
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

  // 学生进入课堂
  async onStudentEnterClassRoom(event: any, args: any): Promise<boolean> {
    this.logger?.log(
      `${MainWindow.preLog}.onStudentEnterClassRoom() args:`,
      args
    );
    try {
      await this.checkAndApplyDevicePrivilege();
      if (this.studentClassRoomWindow) {
        return false; // 防御按钮二次点击导致重复创建
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

  // 老师退出课堂（下课）
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

  // 学生退出课堂
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

  // 收到文本消息
  onMessageReceived(event: any, args: any) {
    this.logger?.log(`${MainWindow.preLog}.onMessageReceived() args:`, args);

    const receivedMessage = args as Array<never>;
    receivedMessage.forEach((item) => store.messages.push(item));
  }

  // 更新当前用户状态
  onChangeLocalUserState(event: any, args: any) {
    this.logger?.log(
      `${MainWindow.preLog}.onChangeLocalUserState() args:`,
      args
    );

    store.currentUser = Object.assign(store.currentUser, args);
  }

  // 更改日志打印级别
  // eslint-disable-next-line class-methods-use-this
  onChangeLogLevel(event: any, newlogLevel: number) {
    setLogLevel(newlogLevel);
  }

  // 选择要分享的屏幕或窗口，打开选择窗口事件处理函数
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

  // 选择要分享的屏幕或窗口，确认事件处理函数
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

    // 隐藏屏幕分享选择窗口
    if (this.shareScreenSelectWindow) {
      this.shareScreenSelectWindow.hide();
    } else {
      this.logger?.error(
        `${MainWindow.preLog}.onConfirmShareScreenWindow hide window failed`
      );
    }

    // 打开屏幕分享窗口（顶部工具栏窗口）
    if (!this.topToolbarWindow) {
      this.topToolbarWindow = await createTopToolbarWindow(store);
    } else {
      this.topToolbarWindow.send(EUserEventNames.ON_INIT_DATA, store);
      this.topToolbarWindow.show();
    }

    // 教师端课堂窗口（白板窗口）进入屏幕分享模式
    if (this.teacherClassRoomWindow) {
      this.teacherClassRoomWindow.send(
        EUserEventNames.ON_START_SHARE_SCREEN_WINDOW,
        store.currentUser.sharingScreenInfo
      );
      this.teacherClassRoomWindow.enterScreenShareMode();
    }
  }

  // 选择要分享的屏幕或窗口，取消事件处理函数
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

  // 结束屏幕分享事件处理函数
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

  // 处理来自顶部工具栏的摄像头开关事件
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

  // 处理来自顶部工具栏的麦克风开关事件
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

  // 处理来自顶部工具栏的全员禁麦事件
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

  // 处理来自顶部工具栏的点名事件
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

  // 处理来自工具栏的摄像头选择框弹出事件
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
        // 顶部工具栏的摄像头选择框弹出事件
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
        // 底部工具栏的摄像头选择框弹出事件
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

  // 处理摄像头选择事件
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

  // 处理来自工具栏的麦克风、扬声器选择框弹出事件
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
        // 顶部工具栏的摄像头选择框弹出事件
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
        // 底部工具栏的摄像头选择框弹出事件
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

  // 处理麦克风选择事件
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

  // 处理扬声器选择事件
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

  // 处理设备数据初始化事件
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
  const mainWindowUrl = 'index.html?view=login';
  const newWindow = new MainWindow(mainWindowConfig, mainWindowUrl, initData);
  await newWindow.init();
  return newWindow;
}
