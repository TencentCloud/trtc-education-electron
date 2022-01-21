import BaseWindow from './window-base';
import Logger from '../logger';
import { createWindow } from '../create-window';

class ShareScreenSelectWindow extends BaseWindow {
  private static preLog = '[ShareScreenSelectWindow]';

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

    this.registerEvent();
    this.browserWindow?.on('closed', this.destroy);
  }

  // eslint-disable-next-line class-methods-use-this
  registerEvent() {}

  // eslint-disable-next-line class-methods-use-this
  unregisterEvent() {}

  destroy() {
    this.unregisterEvent();
    super.destroy();
  }
}

export default ShareScreenSelectWindow;

export async function createShareScreenSelectWindow(
  initData: any
): Promise<ShareScreenSelectWindow> {
  const mainWindowConfig = {
    width: 800,
    height: 600,
    frame: false,
    alwaysOnTop: true,
  };
  const mainWindowUrl = 'index.html?view=share-screen-select';
  const newWindow = new ShareScreenSelectWindow(
    mainWindowConfig,
    mainWindowUrl,
    initData
  );
  await newWindow.init();
  return newWindow;
}
