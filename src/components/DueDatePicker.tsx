import { useRef, type ReactNode } from 'react';

interface Props {
  value?: string;
  onChange: (value?: string) => void;
  label: string;
  className?: string;
  title?: string;
  children: ReactNode;
}

/**
 * Shows custom content with an invisible native date input laid over it, so tapping
 * opens the system date picker on phones. On desktop, showPicker() opens it on click.
 */
export function DueDatePicker({ value, onChange, label, className = '', title, children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <span className={`date-picker ${className}`} title={title}>
      {children}
      <input
        ref={inputRef}
        type="date"
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        onClick={() => {
          try {
            inputRef.current?.showPicker?.();
          } catch {
            // Not supported or not allowed here; the native input still works.
          }
        }}
      />
    </span>
  );
}

export function CalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
