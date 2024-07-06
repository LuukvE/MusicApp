import { BrowserWindow, app, ipcMain } from 'electron';
import path from 'path';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  ipcMain.handle('close-window', closeWindow);
  ipcMain.handle('minimize-window', minimizeWindow);
  ipcMain.handle('toggle-max-window', toggleMaxWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  win.webContents.openDevTools();

  function closeWindow() {
    win.close();
  }

  function minimizeWindow() {
    win.minimize();
  }

  function toggleMaxWindow() {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());

app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
