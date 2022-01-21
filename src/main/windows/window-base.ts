import { BrowserWindow } from 'electron';
import { EUserEventNames } from '../../constants';
import Logger from '../logger';

class BaseWindow {
  static logPrefix = '[BaseWindow]';

  protected windowOptions: Record<string, unknown> | null;

  protected contentUrl: string | null;

  protected initData: any | null;

  protected browserWindow: BrowserWindow | null;

  protected parentWindowId: number | null;

  protected logger: Logger | null = null;

  constructor(
    windowOptions: Record<string, unknown>,
    url: string,
    initData?: any
  ) {
    this.windowOptions = { ...windowOptions };
    this.contentUrl = url;
    this.initData = initData;
    this.browserWindow = null;
    this.parentWindowId = null;

    this.destroy = this.destroy.bind(this);
  }

  get id() {
    return this.browserWindow?.id;
  }

  show() {
    if (this.browserWindow) {
      this.browserWindow.show();
      this.browserWindow.focus();
    } else {
      this.logger?.error(
        `${BaseWindow.logPrefix}.show browserWindow not exist`
      );
    }
  }

  hide() {
    if (this.browserWindow) {
      this.browserWindow.hide();
    } else {
      this.logger?.error(
        `${BaseWindow.logPrefix}.show browserWindow not exist`
      );
    }
  }

  send(eventName: EUserEventNames, data: any) {
    if (this.browserWindow) {
      this.browserWindow.webContents.send(eventName, data);
    } else {
      this.logger?.error(
        `${BaseWindow.logPrefix}.show browserWindow not exist`
      );
    }
  }

  close() {
    if (this.browserWindow) {
      this.browserWindow.close();
    } else {
      this.logger?.error(
        `${BaseWindow.logPrefix}.show browserWindow not exist`
      );
    }
  }

  setBounds(options: { x: number; y: number; width: number; height: number }) {
    if (this.browserWindow) {
      const { x, y, width, height } = options;
      this.browserWindow.setBounds(options, true);
      this.browserWindow.setPosition(x, y, true);
      // windows下，frameless 窗口，必须同时调用 setSize 和 setContentSize 才能真正修改窗口大小
      this.browserWindow.setSize(width, height, true);
      this.browserWindow.setContentSize(width, height, true);
    }
  }

  getBounds() {
    if (this.browserWindow) {
      return this.browserWindow.getBounds();
    }
    throw new Error('browser window not exist');
  }

  setAlwaysOnTop(flag: boolean) {
    if (this.browserWindow) {
      this.browserWindow.setAlwaysOnTop(flag);
    }
  }

  destroy() {
    this.windowOptions = null;
    this.contentUrl = null;
    this.initData = null;
    this.browserWindow = null;
    this.parentWindowId = null;
    if (this.logger) {
      this.logger.destroy();
      this.logger = null;
    }
  }
}

export default BaseWindow;
