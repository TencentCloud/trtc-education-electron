import { screen } from 'electron';
import BaseWindow from './window-base';
import Logger from '../logger';
import { createWindow } from '../create-window';

export const TOP_TOOLBAR_WIDTH = 700; // 1000;
export const TOP_TOOLBAR_HEIGHT = 52;

class TopToolbarWindow extends BaseWindow {
  private static preLog = '[TopToolbarWindow]';

  constructor(options: Record<string, unknown>, url: string, initData: any) {
    super(options, url, initData);
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

    this.browserWindow?.on('closed', this.destroy);
  }

  destroy() {
    super.destroy();
  }
}

export default TopToolbarWindow;

export async function createTopToolbarWindow(
  initOptions: any
): Promise<TopToolbarWindow> {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  const mainWindowConfig = {
    width: TOP_TOOLBAR_WIDTH,
    height: TOP_TOOLBAR_HEIGHT,
    x: (width - TOP_TOOLBAR_WIDTH) / 2,
    y: 0,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    hasShadow: false,
  };
  const mainWindowUrl = 'index.html?view=class-room-top';
  const newWindow = new TopToolbarWindow(
    mainWindowConfig,
    mainWindowUrl,
    initOptions
  );
  await newWindow.init();
  return newWindow;
}
