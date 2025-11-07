import { ReactNode } from 'react';
import Navbar from '../Navbar';
import GhostCursor from '../effects/GhostCursor';

interface PublicLayoutProps { children: ReactNode }

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="container-max">
        {children}
      </main>
      <GhostCursor zIndex={-1} mixBlendMode="screen" />
    </div>
  );
}
