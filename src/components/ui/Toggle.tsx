interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-3 w-full px-4 py-3 border-brutal-thin
        font-medium cursor-pointer transition-colors select-none
        ${checked ? 'bg-accent/20 border-accent' : 'bg-white hover:bg-gray-50'}`}
    >
      <div
        className={`w-6 h-6 border-brutal-thin flex items-center justify-center
          ${checked ? 'bg-accent' : 'bg-white'}`}
      >
        {checked && (
          <svg className="w-4 h-4 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span>{label}</span>
    </button>
  );
}
