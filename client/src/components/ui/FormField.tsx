import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <div className="mb-6 relative">
      <label className="block text-[var(--text)] text-sm font-medium mb-2" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}


