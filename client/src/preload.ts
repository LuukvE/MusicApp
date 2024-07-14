import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  signout: () => ipcRenderer.invoke('signout'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  googleRedirect: () => ipcRenderer.invoke('google-redirect'),
  toggleMaxWindow: () => ipcRenderer.invoke('toggle-max-window')
};

export type ElectronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
