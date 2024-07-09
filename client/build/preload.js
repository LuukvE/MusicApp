"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  closeWindow: () => electron.ipcRenderer.invoke("close-window"),
  minimizeWindow: () => electron.ipcRenderer.invoke("minimize-window"),
  toggleMaxWindow: () => electron.ipcRenderer.invoke("toggle-max-window")
});
