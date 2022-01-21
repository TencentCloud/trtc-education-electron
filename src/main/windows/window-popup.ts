import { EUserEventNames } from '../../constants';
import { resolveHtmlPath } from '../util';
import BaseWindow from './window-base';
import Logger from '../logger';
import { createWindow } from '../create-window';

export const popupConstant = {
  ITEM_HEIGHT: 32,
  MARGIN_TOP: 16,
  MARGIN_BOTTOM: 16,
  BORDER_WIDTH: 2,
  INDENT_DISTANCE_TO_ICON: 16,
};

class PopupWindow extends BaseWindow {
  private static preLog = '[PopupWindow]';

  private dataToRender: any;

  constructor(options: Record<string, unknown>, url: string, initData: any) {
    super(options, url, initData);
    this.dataToRender = null;

    this.onDidFinishLoadHandler = this.onDidFinishLoadHandler.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  async init() {
    this.browserWindow = await createWindow(
      this.windowOptions || {},
      this.contentUrl || '',
      this.initData
    );
    this.browserWindow.webContents.on(
      'did-finish-load',
      this.onDidFinishLoadHandler
    );

    // logger 从父类继承
    this.logger = new Logger(this.browserWindow);

    this.browserWindow.on('blur', this.onBlur);
    this.browserWindow.on('closed', this.destroy);
  }

  private onDidFinishLoadHandler() {
    if (!this.browserWindow) {
      throw new Error(`${PopupWindow.preLog}createWindow failed with options`);
    }

    if (this.dataToRender) {
      this.browserWindow.webContents.send(
        EUserEventNames.ON_INIT_DATA,
        this.dataToRender
      );
    }
  }

  position(bounds: { x: number; y: number; width: number; height: number }) {
    this.logger?.log(`${PopupWindow.preLog}position bounds:`, bounds);
    const { width, height } = bounds;
    if (this.browserWindow) {
      this.browserWindow.setBounds(bounds, true);
      this.browserWindow.setSize(width, height, true);
      this.browserWindow.setContentSize(width, height, true);
    }
  }

  async loadPage(url: string, data: any): Promise<void> {
    if (url) {
      this.dataToRender = data;
      const response = await this.browserWindow?.loadURL(resolveHtmlPath(url));
      return response;
    }
    throw new Error('URL 地址不能为空');
  }

  private onBlur() {
    if (this.browserWindow) {
      this.browserWindow.hide();
    }
  }

  destroy() {
    this.dataToRender = null;
    super.destroy();
  }
}

export default PopupWindow;

export async function createPopupWindow(
  initOptions: any
): Promise<PopupWindow> {
  const windowConfig = {
    width: 200,
    height: 300,
    x: 100,
    y: 100,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
  };

  const newWindow = new PopupWindow(windowConfig, '', initOptions);
  await newWindow.init();
  return newWindow;
}
