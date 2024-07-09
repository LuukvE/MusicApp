"use strict";
const electron = require("electron");
const path = require("path");
const createWindow = () => {
  const win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });
  electron.ipcMain.handle("close-window", closeWindow);
  electron.ipcMain.handle("minimize-window", minimizeWindow);
  electron.ipcMain.handle("toggle-max-window", toggleMaxWindow);
  {
    win.loadURL("http://localhost:5173");
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
electron.app.on("ready", createWindow);
electron.app.on("window-all-closed", () => process.platform !== "darwin" && electron.app.quit());
electron.app.on("activate", () => electron.BrowserWindow.getAllWindows().length === 0 && createWindow());
