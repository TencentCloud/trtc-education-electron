import { BrowserWindow } from 'electron';
import {
  isArrayOrObject,
  isInstanceOfError,
  stringifyError,
} from '../util/common-util';
import { LogLevelType, LogContext, getLogPrefix } from '../util/logger-util';

let currentLogLevel = LogLevelType.LOG_LEVEL_LOG;

function args2String(...args: any[]) {
  let s = null;
  if (args.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    s = args[0];
  } else {
    s = '';
    const { length } = args;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < length; i++) {
      if (isArrayOrObject(args[i])) {
        if (isInstanceOfError(args[i])) {
          s += stringifyError(args[i]);
        } else {
          s += JSON.stringify(args[i]);
        }
      } else {
        s += args[i];
      }
      s += ' ';
    }
  }
  return s;
}

class Logger {
  private win: BrowserWindow | null | undefined;

  constructor(win?: BrowserWindow) {
    this.win = win;
  }

  debug(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_DEBUG) {
      const logPrefix = getLogPrefix(LogContext.MAIN);
      const text = args2String(...args);
      if (this.win && this.win.webContents) {
        this.win.webContents.executeJavaScript(
          `console.debug('${logPrefix} ${text}')`
        );
      }
      console.debug(`${logPrefix}`, args);
    }
  }

  log(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_LOG) {
      const logPrefix = getLogPrefix(LogContext.MAIN);
      const text = args2String(...args);
      if (this.win && this.win.webContents) {
        this.win.webContents.executeJavaScript(
          `console.log('${logPrefix} ${text}')`
        );
      }
      console.log(`${logPrefix}`, args);
    }
  }

  info(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_INFO) {
      const logPrefix = getLogPrefix(LogContext.MAIN);
      const text = args2String(...args);
      if (this.win && this.win.webContents) {
        this.win.webContents.executeJavaScript(
          `console.info('${logPrefix} ${text}')`
        );
      }
      console.info(`${logPrefix}`, args);
    }
  }

  warn(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_WARN) {
      const logPrefix = getLogPrefix(LogContext.MAIN);
      const text = args2String(...args);
      if (this.win && this.win.webContents) {
        this.win.webContents.executeJavaScript(
          `console.warn('${logPrefix} ${text}')`
        );
      }
      console.warn(`${logPrefix}`, args);
    }
  }

  error(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_ERROR) {
      const logPrefix = getLogPrefix(LogContext.MAIN);
      const text = args2String(...args);
      if (this.win && this.win.webContents) {
        this.win.webContents.executeJavaScript(
          `console.error('${logPrefix} ${text}')`
        );
      }
      console.error(`${logPrefix}`, args);
    }
  }

  destroy() {
    this.win = null;
  }
}

export function setLogLevel(newLevel: number) {
  const logPrefix = getLogPrefix(LogContext.MAIN);
  if (
    newLevel >= LogLevelType.LOG_LEVEL_DEBUG &&
    newLevel <= LogLevelType.LOG_LEVEL_NON_LOGGING
  ) {
    console.log(
      `${logPrefix} set log level from ${currentLogLevel} to ${newLevel}`
    );
    currentLogLevel = newLevel;
  } else {
    console.error(`${logPrefix} setLogLevel() invalid params:${newLevel}`);
  }
}

export function getLogLevel() {
  return currentLogLevel;
}

// 用于非窗口的日志打印
export const commonLogger = new Logger();

export default Logger;
