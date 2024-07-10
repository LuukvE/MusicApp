import '@fortawesome/fontawesome-svg-core';
import { faTimes, faWindowMaximize, faWindowMinimize, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';
import { ElectronAPI } from 'src/preload';

import useFetch from '../hooks/useFetch';
import useStore from '../hooks/useStore';
import Detail from './Detail';
import Player from './Player';
import Queue from './Queue';
import TrackList from './TrackList';

const electron = (window as any).electronAPI as ElectronAPI;

export default function App() {
  const { load } = useFetch();
  const { maximized, selected, update } = useStore(({ maximized, selected, update }) => ({ maximized, selected, update }));

  const closeWindow = () => electron.closeWindow();

  const minimizeWindow = () => electron.minimizeWindow();

  const toggleMaxWindow = () => {
    electron.toggleMaxWindow();

    update({ maximized: !maximized });
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex h-full flex-col">
      <div className="app-region flex h-5 w-full items-center justify-end gap-2 px-2 text-sm text-white/70">
        <div className="cursor-pointer hover:text-white">
          <FontAwesomeIcon className="-translate-y-1" onClick={minimizeWindow} icon={faWindowMinimize} />
        </div>
        <FontAwesomeIcon
          className="cursor-pointer hover:text-white"
          onClick={toggleMaxWindow}
          icon={maximized ? faWindowRestore : faWindowMaximize}
        />
        <FontAwesomeIcon className="cursor-pointer hover:text-white" onClick={closeWindow} icon={faTimes} />
      </div>
      <div className="flex grow basis-0 overflow-hidden">
        <TrackList />
        {selected && <Detail />}
        {!selected && <Queue />}
      </div>
      <Player />
    </div>
  );
}
