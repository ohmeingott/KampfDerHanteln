import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-bold text-sm">{label}</label>}
      <input
        className={`border-brutal-thin px-4 py-2.5 text-base font-medium
          bg-white focus:outline-none focus:shadow-brutal-sm
          transition-shadow ${className}`}
        {...props}
      />
    </div>
  );
}
