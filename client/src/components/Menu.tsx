import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import { ElectronAPI } from 'src/preload';

import useStore from '../hooks/useStore';

const electron = (window as any).electronAPI as ElectronAPI;

export default function Menu() {
  const { users, session, update } = useStore(({ users, session, update }) => ({ users, session, update }));
  const user = useMemo(() => users[session.user], [users, session?.user]);

  return (
    <div className="flex h-full w-52 flex-col gap-4 bg-black/10 pl-5 pr-4 text-white/90">
      <div className="flex items-center">
        <div className="mr-2 h-5 w-5 rounded-full bg-black/10 bg-cover" style={{ backgroundImage: `url("${user?.picture || ''}")` }} />
        <span className="flex w-full grow items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs">{user?.name}</span>
        <FontAwesomeIcon
          className="cursor-pointer opacity-20 hover:opacity-100"
          onClick={() => {
            update({ tracks: {}, users: {}, session: null, artists: {} });

            electron.signout();
          }}
          icon={faRightFromBracket}
        />
      </div>
    </div>
  );
}
