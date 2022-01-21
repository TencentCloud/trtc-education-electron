import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './windows/window-main';
import store from './store';

let mainWindow: BrowserWindow | null = null;

async function initApp() {
  const newWindow = await createMainWindow({ ...store });
  mainWindow = newWindow.getBrowserWindow();

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

const trtcEduApp = {
  mainWindow,
};

export default trtcEduApp;
