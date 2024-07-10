import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  toggleMaxWindow: () => ipcRenderer.invoke('toggle-max-window')
};

export type ElectronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
