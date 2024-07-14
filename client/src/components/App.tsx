import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fortawesome/fontawesome-svg-core';
import { faTimes, faWindowMaximize, faWindowMinimize, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect } from 'react';
import { ElectronAPI } from 'src/preload';

import useFetch from '../hooks/useFetch';
import useStore from '../hooks/useStore';
import Detail from './Detail';
import Menu from './Menu';
import Player from './Player';
import Queue from './Queue';
import TrackList from './TrackList';

const electron = (window as any).electronAPI as ElectronAPI;

export default function App() {
  const { load } = useFetch();
  const { maximized, selected, session, update } = useStore(({ maximized, session, selected, update }) => ({ maximized, session, selected, update }));

  const closeWindow = useCallback(() => electron.closeWindow(), []);

  const minimizeWindow = useCallback(() => electron.minimizeWindow(), []);

  const toggleMaxWindow = useCallback(() => {
    electron.toggleMaxWindow();

    update({ maximized: !maximized });
  }, []);

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
      {session && (
        <>
          <div className="flex grow basis-0 overflow-hidden">
            <Menu />
            <TrackList />
            {selected && <Detail />}
            {!selected && <Queue />}
          </div>
          <Player />
        </>
      )}
      {!session && (
        <div className="flex w-full grow items-center justify-center">
          <SignInWithGoogle />
        </div>
      )}
    </div>
  );
}

const SignInWithGoogle = () => (
  <div
    onClick={() => electron.googleRedirect()}
    className="flex h-10 cursor-pointer items-center rounded border border-black bg-[#131314] px-4 text-sm font-medium text-white/50 hover:bg-black"
  >
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="mr-2 block h-5 w-5"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
    Sign in with Google
  </div>
);
