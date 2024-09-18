import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { resolveHtmlPath } from './util';
import { EUserEventNames } from '../constants';
import store from './store';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')({ showDevTools: false });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

export function getAssetPath(...paths: string[]): string {
  return path.join(RESOURCES_PATH, ...paths);
}

const defaultOptions = {
  show: false,
  icon: getAssetPath('icon.png'),
  acceptFirstMouse: true,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: true,
    contextIsolation: false,
    webSecurity: false,
  },
};

export async function createWindow(
  options: Record<string, any>,
  url: string,
  initData?: any
) {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    /**
     * 安装 React 开发者工具时，需要访问 Chrome App Store，国内网络默认无法访问，
     * 安装时会有超时的报错提示。
     * 如果可以访问 Chrome App Store，可以取消下面一行代码的注释。
     * 如果不能访问 Chrome App Store，仍然希望安装 React 开发者工具，可以尝试
     * 以下链接中的方法：
     * https://www.electronjs.org/docs/latest/tutorial/devtools-extension#manually-loading-a-devtools-extension
     */
    // await installExtensions();
  }

  const newWindowOptions = { ...defaultOptions, ...options };
  let newWindow: BrowserWindow | null = new BrowserWindow(newWindowOptions);
  store.windowBaseInfoMap[newWindow.id] = {
    mediaSourceId: newWindow.getMediaSourceId().split(':')[1],
    windowID: newWindow.id,
  };

  if (url) {
    newWindow.loadURL(resolveHtmlPath(url));
  }

  newWindow.webContents.on('did-finish-load', () => {
    if (!newWindow) {
      throw new Error(
        `createWindow failed with options: ${JSON.stringify(newWindowOptions)}`
      );
    }

    if (process.env.START_MINIMIZED) {
      newWindow.minimize();
    } else {
      // 处理窗口创建后控制参数
      let { afterLoadConfig } = initData;
      if (!afterLoadConfig) {
        afterLoadConfig = { show: true, focus: true };
      } else {
        delete initData.afterLoadConfig; // 控制参数使用完毕要删除，不用发送给页面
      }

      if (afterLoadConfig.show) {
        newWindow.show();
      }
      if (afterLoadConfig.focus) {
        newWindow.focus();
      }
    }

    if (initData) {
      newWindow?.webContents.send(EUserEventNames.ON_INIT_DATA, {
        ...initData,
        currentWindowID: newWindow.getMediaSourceId().split(':')[1],
      });
    }
  });

  newWindow.on('close', () => {
    if (newWindow) {
      if (store.windowBaseInfoMap[newWindow.id]) {
        delete store.windowBaseInfoMap[newWindow.id];
      }
    }
  });

  newWindow.on('closed', () => {
    newWindow = null;
  });

  newWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url.startsWith('https:') || details.url.startsWith('http:')) {
      shell.openExternal(details.url);
    }
    return { action: 'deny' };
  });

  return newWindow;
}
