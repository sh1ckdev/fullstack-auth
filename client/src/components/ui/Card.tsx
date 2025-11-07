import { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Card({ title, extra, className = '', children }: CardProps) {
  return (
    <div className={`card p-5 ${className}`}>
      {(title || extra) && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-[var(--text)] font-semibold text-lg">{title}</div>
          <div>{extra}</div>
        </div>
      )}
      {children}
    </div>
  );
}
