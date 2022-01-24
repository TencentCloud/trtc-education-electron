import { ipcMain, screen } from 'electron';
import BaseWindow from './window-base';
import Logger from '../logger';
import { createWindow } from '../create-window';
import store from '../store';
import { EWindowMode, EWindowSizeMode } from '../../types';
import { EUserEventNames } from '../../constants';

const HEADER_HEIGHT = 32;
const SINGLE_VIDEO_HEIGHT = 148;
const VIDEO_LIST_WINDOW_WIDTH = 254;

class ClassRoomWindow extends BaseWindow {
  private static prelog = '[ClassRoomWindow]';

  private whiteboardWindowBounds: any;

  private windowMode = EWindowMode.Whiteboard;

  private videoListWindowSizeMode = EWindowSizeMode.Maximize;

  private videoListWindowHeight = 0;

  constructor(options: Record<string, unknown>, url: string, initData: any) {
    super(options, url, initData);
    this.whiteboardWindowBounds = null;

    this.addUser = this.addUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.changeVideoListWindowMode = this.changeVideoListWindowMode.bind(this);
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

  private addUser(event: any, user: Record<string, any>) {
    this.logger?.log(`${ClassRoomWindow.prelog}addUser:`, user);
    store.userMap[user.ID] = user;

    if (this.windowMode === EWindowMode.ScreenShare) {
      this.adaptWindowHeight();
    }
  }

  private deleteUser(event: any, user: Record<string, any>) {
    this.logger?.log(`${ClassRoomWindow.prelog}deleteUser:`, user);
    delete store.userMap[user.ID];

    if (this.windowMode === EWindowMode.ScreenShare) {
      this.adaptWindowHeight();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private updateUser(event: any, user: Record<string, any>) {
    this.logger?.log(`${ClassRoomWindow.prelog}updateUser:`, user);
    const old = store.userMap[user.ID];
    if (old) {
      store.userMap[user.ID] = {
        ...old,
        ...user,
      };
    }
  }

  enterScreenShareMode() {
    this.logger?.log(`${ClassRoomWindow.logPrefix}onEnterScreenShareMode`);
    if (this.windowMode === EWindowMode.ScreenShare) {
      this.logger?.debug(
        `${ClassRoomWindow.logPrefix}onEnterScreenShareMode already in screen share mode, exit.`
      );
      return; // 已经进入屏幕分享模式，直接退出
    }
    this.windowMode = EWindowMode.ScreenShare;
    if (this.browserWindow) {
      this.browserWindow.setResizable(false);
      this.browserWindow.setMinimumSize(VIDEO_LIST_WINDOW_WIDTH, HEADER_HEIGHT);
      this.browserWindow.setAlwaysOnTop(true);

      const userCount = Object.keys(store.userMap).length || 1;
      this.videoListWindowHeight =
        HEADER_HEIGHT + (userCount <= 4 ? userCount : 4) * SINGLE_VIDEO_HEIGHT;
      const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
      this.whiteboardWindowBounds = this.browserWindow.getBounds();
      const bounds = {
        x: screenWidth - VIDEO_LIST_WINDOW_WIDTH,
        y: 100,
        width: VIDEO_LIST_WINDOW_WIDTH,
        height: this.videoListWindowHeight,
      };
      this.logger?.debug(
        `${ClassRoomWindow.prelog}enterScreenShareMode bounds:`,
        bounds
      );
      if (process.platform === 'win32') {
        // windows 下需要延迟处理，否则修改窗口大小、位置不生效
        setTimeout(() => {
          this.setBounds(bounds);
        }, 100);
      } else {
        this.setBounds(bounds);
      }
    }
  }

  private enterWhiteboardBounds() {
    if (this.browserWindow) {
      this.browserWindow.setResizable(true);
      this.browserWindow.setMinimumSize(1200, 640);
      this.browserWindow.setAlwaysOnTop(false);
      if (this.whiteboardWindowBounds) {
        this.logger?.debug(
          `${ClassRoomWindow.prelog}enterWhiteboardBounds bounds:`,
          this.whiteboardWindowBounds
        );
        this.setBounds(this.whiteboardWindowBounds);
        this.whiteboardWindowBounds = null;
      }

      this.videoListWindowSizeMode = EWindowSizeMode.Maximize;
    }
  }

  enterWhiteboardMode() {
    this.logger?.log(`${ClassRoomWindow.logPrefix}onEnterWhiteboardMode`);
    this.windowMode = EWindowMode.Whiteboard;
    if (process.platform === 'win32') {
      setTimeout(() => {
        this.enterWhiteboardBounds();
      }, 100);
    } else {
      this.enterWhiteboardBounds();
    }
  }

  private adaptWindowHeight() {
    if (this.browserWindow) {
      const userCount = Object.keys(store.userMap).length || 1;
      this.videoListWindowHeight =
        HEADER_HEIGHT + (userCount <= 4 ? userCount : 4) * SINGLE_VIDEO_HEIGHT;
      if (this.videoListWindowSizeMode === EWindowSizeMode.Maximize) {
        this.browserWindow.setSize(
          VIDEO_LIST_WINDOW_WIDTH,
          this.videoListWindowHeight,
          true
        );
        this.browserWindow.setContentSize(
          VIDEO_LIST_WINDOW_WIDTH,
          this.videoListWindowHeight,
          true
        );
      }
    }
  }

  private changeVideoListWindowMode(
    event: any,
    args: {
      mode: EWindowSizeMode;
    }
  ) {
    this.logger?.log(
      `${ClassRoomWindow.logPrefix}changeVideoListWindowMode args:`,
      args
    );
    this.videoListWindowSizeMode = args.mode;
    if (this.browserWindow) {
      if (this.windowMode === EWindowMode.ScreenShare) {
        // windows下，frameless 窗口，必须同时调用 setSize 和 setContentSize 才能真正修改窗口大小
        if (this.videoListWindowSizeMode === EWindowSizeMode.Minimize) {
          this.browserWindow.setSize(VIDEO_LIST_WINDOW_WIDTH, HEADER_HEIGHT);
          this.browserWindow.setContentSize(
            VIDEO_LIST_WINDOW_WIDTH,
            HEADER_HEIGHT
          );
        } else {
          // MAX
          this.browserWindow.setSize(
            VIDEO_LIST_WINDOW_WIDTH,
            this.videoListWindowHeight
          );
          this.browserWindow.setContentSize(
            VIDEO_LIST_WINDOW_WIDTH,
            this.videoListWindowHeight
          );
        }
      }
    }
  }

  private registerEvent() {
    ipcMain.on(EUserEventNames.ON_ADD_USER, this.addUser);
    ipcMain.on(EUserEventNames.ON_DELETE_USER, this.deleteUser);
    ipcMain.on(EUserEventNames.ON_UPDATE_USER, this.updateUser);
    ipcMain.on(
      EUserEventNames.ON_CHANGE_VIDEO_LIST_WINDOW_MODE,
      this.changeVideoListWindowMode
    );
  }

  private unregisterEvent() {
    ipcMain.removeListener(EUserEventNames.ON_ADD_USER, this.addUser);
    ipcMain.removeListener(EUserEventNames.ON_DELETE_USER, this.deleteUser);
    ipcMain.removeListener(EUserEventNames.ON_UPDATE_USER, this.updateUser);
    ipcMain.removeListener(
      EUserEventNames.ON_CHANGE_VIDEO_LIST_WINDOW_MODE,
      this.changeVideoListWindowMode
    );
  }

  destroy() {
    this.unregisterEvent();
    super.destroy();
  }
}

export default ClassRoomWindow;

export async function createTeacherClassRoomWindow(
  initData = {}
): Promise<ClassRoomWindow> {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const mainWindowConfig = {
    width,
    height,
    minWidth: 1200,
    minHeight: 640,
    frame: false,
    hasShadow: false,
  };
  const mainWindowUrl = 'index.html?view=class-room';
  const newWindow = new ClassRoomWindow(mainWindowConfig, mainWindowUrl, {
    ...initData,
  });
  await newWindow.init();
  return newWindow;
}

export async function createStudentClassRoomWindow(
  initData = {}
): Promise<ClassRoomWindow> {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const studentWindowConfig = {
    width,
    height,
    minWidth: 1200,
    minHeight: 640,
  };
  const studentHomeUrl = 'index.html?view=student';
  const win = new ClassRoomWindow(studentWindowConfig, studentHomeUrl, {
    ...initData,
  });
  await win.init();
  return win;
}
