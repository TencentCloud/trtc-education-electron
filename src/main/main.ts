import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow, crashReporter } from 'electron';
import path from 'path';
import { createMainWindow } from './windows/window-main';
import store from './store';

// 开启crash捕获
crashReporter.start({
  productName: 'trtc-education-electron',
  companyName: 'Tencent Cloud',
  submitURL: 'https://cloud.tencent.com',
  uploadToServer: false,
  ignoreSystemCrashHandler: false,
});

let crashFilePath = '';
let crashDumpsDir = '';
try {
  // electron 低版本
  crashFilePath = path.join(app.getPath('temp'), `${app.getName()} Crashes`);
  console.log('————————crash path:', crashFilePath);

  // electron 高版本
  crashDumpsDir = app.getPath('crashDumps');
  console.log('————————crashDumpsDir:', crashDumpsDir);
} catch (e) {
  console.error('获取奔溃文件路径失败', e);
}

let mainWindow: BrowserWindow | null = null;

async function initApp() {
  const newWindow = await createMainWindow({ ...store });
  mainWindow = newWindow.getBrowserWindow();

  mainWindow?.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send(
      'crash-file-path',
      `${crashFilePath}|${crashDumpsDir}`
    );
  });

  mainWindow?.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(initApp).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) initApp();
});

app.on('gpu-process-crashed', (event, kill) => {
  console.warn('app:gpu-process-crashed', kill);
});

app.on('renderer-process-crashed', (event, webContents, kill) => {
  console.warn('app:renderer-process-crashed', kill);
});

app.on('render-process-gone', (event, webContents, details) => {
  console.warn('app:render-process-gone', details);
});

app.on('child-process-gone', (event, details) => {
  console.warn('app:child-process-gone', details);
});

const trtcEduApp = {
  mainWindow,
};

export default trtcEduApp;
