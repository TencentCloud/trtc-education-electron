import { EUserEventNames } from '../../constants';
import { LogLevelType, LogContext, getLogPrefix } from '../../util/logger-util';

export { LogLevelType } from '../../util/logger-util';

let currentLogLevel = LogLevelType.LOG_LEVEL_LOG;

const logger = {
  debug(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_DEBUG) {
      console.debug(`${getLogPrefix(LogContext.RENDER)}`, ...args);
    }
  },
  log(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_LOG) {
      console.log(`${getLogPrefix(LogContext.RENDER)}`, ...args);
    }
  },
  info(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_INFO) {
      console.info(`${getLogPrefix(LogContext.RENDER)}`, ...args);
    }
  },
  warn(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_WARN) {
      console.warn(`${getLogPrefix(LogContext.RENDER)}`, ...args);
    }
  },
  error(...args: any[]) {
    if (currentLogLevel <= LogLevelType.LOG_LEVEL_ERROR) {
      console.error(`${getLogPrefix(LogContext.RENDER)}`, ...args);
    }
  },
  setLevel(newLevel: number) {
    if (
      newLevel >= LogLevelType.LOG_LEVEL_DEBUG &&
      newLevel <= LogLevelType.LOG_LEVEL_NON_LOGGING
    ) {
      console.log(
        `${getLogPrefix(
          LogContext.RENDER
        )} set log level from ${currentLogLevel} to ${newLevel}`
      );
      currentLogLevel = newLevel;

      // 通知主进程
      if ((window as any).electron?.ipcRenderer) {
        (window as any).electron.ipcRenderer.send(
          EUserEventNames.ON_CHANGE_LOG_LEVEL,
          newLevel
        );
      }
    } else {
      console.error(
        `${getLogPrefix(
          LogContext.RENDER
        )} logger.setLevel() invalid params:${newLevel}`
      );
    }
  },
  getLevel() {
    return currentLogLevel;
  },
};

export default logger;
