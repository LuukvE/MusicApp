import { BeforeSendResponse, BrowserWindow, OnBeforeSendHeadersListenerDetails, app, ipcMain, session, shell } from 'electron';
import path from 'path';

const isDev = !!MAIN_WINDOW_VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null = null;

(function init() {
  if (isDev && process.platform === 'win32') {
    app.setAsDefaultProtocolClient('shower', process.execPath, [path.resolve(process.argv[1])]);
  } else {
    app.setAsDefaultProtocolClient('shower');
  }

  app.on('open-url', function (event, data) {
    console.log('hi', data);
  });

  if (!app.requestSingleInstanceLock()) return app.quit();

  app.on('second-instance', (e, argv) => {
    const url = argv.pop();

    signin(url);
  });

  app.on('ready', createWindow);

  app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());

  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
})();

function signin(url: string) {
  const sessionID = url.split('/')[2];

  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: ['http://localhost:8080/*']
    },
    (details, callback) => {
      details.requestHeaders['Authorization'] = sessionID;

      callback({ requestHeaders: details.requestHeaders });
    }
  );

  mainWindow.focus();

  if (isDev) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  ipcMain.handle('signout', signout);
  ipcMain.handle('close-window', closeWindow);
  ipcMain.handle('minimize-window', minimizeWindow);
  ipcMain.handle('google-redirect', googleRedirect);
  ipcMain.handle('toggle-max-window', toggleMaxWindow);

  if (isDev) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();

  function closeWindow() {
    mainWindow.close();
  }

  function minimizeWindow() {
    mainWindow.minimize();
  }

  function signout() {
    session.defaultSession.removeAllListeners('onBeforeSendHeaders');
  }

  function googleRedirect() {
    shell.openExternal('http://localhost:8080/google/sign-in');
  }

  function toggleMaxWindow() {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
}
