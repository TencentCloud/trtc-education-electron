import { productName } from '../../../package.json';
import logger from './logger';

const LOCAL_STORAGE_KEY = 'reportedEvents';

class Monitor {
  static logPrefix = '[Monitor]';

  private appName = productName;

  private uin = '';

  private sdkAppId: number | string = 0;

  private aegis: any;

  private isOpen = true;

  private reportedEventMap: Record<string, any> = {};

  constructor(options?: Record<string, any>) {
    this.aegis = (window as any).aegis;
    if (options) {
      const { sdkAppId, uin } = options;
      this.sdkAppId = sdkAppId || 0;
      this.uin = uin;
    }
    if (!this.sdkAppId) {
      this.initSdkAppId();
    }
    this.aegis.setConfig({
      uin: this.uin,
      ext2: this.appName,
      ext3: this.sdkAppId,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  private async initSdkAppId() {
    if ((window as any).electron?.genTestUserSig) {
      const { sdkAppId } = (window as any).electron.genTestUserSig(
        localStorage.getItem('userID') || ''
      );
      this.setSdkAppID(sdkAppId);
    }
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  isUsable() {
    return this.aegis && this.isOpen;
  }

  setSdkAppID(sdkAppId: number | string) {
    this.sdkAppId = sdkAppId;
    this.aegis.setConfig({
      ext3: this.sdkAppId,
    });
  }

  setUid(uin: string) {
    this.uin = uin;
    this.aegis.setConfig({
      uin,
    });
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

  reportEvent(eventName: string, extraInfo?: string) {
    if (this.isUsable() && this.aegis?.reportEvent) {
      const eventKey = extraInfo ? `${eventName}-${extraInfo}` : eventName;
      if (!this.isEventKeyExisted(eventKey)) {
        this.aegis.reportEvent({
          name: eventName,
          ext1: eventKey,
        });
        this.storeEventKey(eventKey);
      }
    }
  }

  private isEventKeyExisted(key: string) {
    this.loadReportedEvent();
    return !!this.reportedEventMap[key];
  }

  private loadReportedEvent() {
    const reportedEventJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    let result = {};
    if (reportedEventJSON) {
      try {
        result = JSON.parse(reportedEventJSON);
      } catch (error) {
        logger.error(
          `${Monitor.logPrefix} JSON.parse error:`,
          reportedEventJSON
        );
      }
    }
    this.reportedEventMap = result;
  }

  private storeEventKey(key: string) {
    this.reportedEventMap[key] = true;
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(this.reportedEventMap)
    );
  }

  // eslint-disable-next-line class-methods-use-this
  clearStorage() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}

(window as any).appMonitor = new Monitor();
