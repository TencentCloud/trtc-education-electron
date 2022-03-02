class Monitor {
  private appName = 'trtc-education-electron-v2';

  private uin = '';

  private sdkAppID: number | string = 0;

  private aegis = (window as any).aegis;

  private isOpen = true;

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  isUsable() {
    if (!this.aegis) {
      this.aegis = (window as any).aegis;
    }
    return this.aegis && this.isOpen;
  }

  setSdkAppID(sdkAppID: number | string) {
    this.sdkAppID = sdkAppID;
  }

  setUid(uin: string) {
    this.uin = uin;
    if (this.aegis?.setConfig) {
      this.aegis.setConfig({
        uin,
        ext2: this.appName,
        ext3: this.sdkAppID,
      });
    }
  }

  info(info: string, extraInfo?: string) {
    if (this.isUsable() && this.aegis?.info) {
      this.aegis.info({
        msg: info,
        ext1: extraInfo,
        trace: 'trace',
      });
    }
  }

  infoAll(info: string, extraInfo?: string) {
    if (this.isUsable() && this.aegis?.infoAll) {
      this.aegis.infoAll({
        msg: info,
        ext1: extraInfo,
        trace: 'trace',
      });
    }
  }

  error(error: any) {
    if (this.isUsable() && this.aegis?.error) {
      this.aegis.error(error);
    }
  }

  reportEvent(eventName: string) {
    if (this.isUsable() && this.aegis?.reportEvent) {
      this.aegis.reportEvent({
        name: eventName, // 必填
        ext1: eventName,
      });
    }
  }
}

(window as any).appMonitor = new Monitor();
