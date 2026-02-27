import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border-brutal shadow-brutal p-6 ${className}`}>
      {children}
    </div>
  );
}
