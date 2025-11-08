import { ReactNode } from 'react';
import FAB from './FAB';
import GhostCursor from '../effects/GhostCursor';

interface AppShellProps { children: ReactNode }

const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="relative min-h-screen">
      <main className="min-h-screen">
        <div className="container-max">
          {children}
        </div>
        {/* Floating Action Button с радиальным меню */}
        <FAB />
      </main>
      {/* <GhostCursor zIndex={-1} mixBlendMode="screen" /> */}
    </div>
  )
};

export default AppShell;
