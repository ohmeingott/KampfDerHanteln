import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'extreme' | 'success' | 'streak';
}

const badgeVariants = {
  default: 'bg-gray-200 text-dark',
  extreme: 'bg-red-500 text-white',
  success: 'bg-accent text-dark',
  streak: 'bg-secondary text-dark',
};

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-bold border-brutal-thin
        ${badgeVariants[variant]}`}
    >
      {children}
    </span>
  );
}
