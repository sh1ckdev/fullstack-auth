import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  trailingIconAriaLabel?: string;
  onTrailingIconClick?: () => void;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  className = '',
  error,
  leadingIcon,
  trailingIcon,
  trailingIconAriaLabel,
  onTrailingIconClick,
  containerClassName = '',
  ...rest
}, ref) {
  const hasLeading = Boolean(leadingIcon);
  const hasTrailing = Boolean(trailingIcon);
  const baseModern = 'w-full rounded-lg py-3 px-4 transition-all duration-200 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]';
  const paddingClasses = `${hasLeading ? 'pl-11' : ''} ${hasTrailing ? 'pr-11' : ''}`;
  const classes = `${baseModern} ${paddingClasses} ${className}`.trim();

  const renderTrailing = () => {
    if (!hasTrailing || !trailingIcon) return null;
    if (onTrailingIconClick) {
      return (
        <button
          type="button"
          onClick={onTrailingIconClick}
          aria-label={trailingIconAriaLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          {trailingIcon}
        </button>
      );
    }
    return (
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
        {trailingIcon}
      </span>
    );
  };

  return (
    <div className={containerClassName}>
      <div className="relative">
        {hasLeading && leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {leadingIcon}
          </span>
        )}
        {renderTrailing()}
        <input ref={ref} className={classes} {...rest} />
      </div>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
});


