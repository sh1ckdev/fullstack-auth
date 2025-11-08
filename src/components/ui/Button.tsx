import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--brand)] hover:brightness-95 text-[var(--surface)]',
  secondary: 'bg-[#111111] hover:brightness-110 text-white',
  danger: 'bg-[#D92D20] hover:brightness-110 text-white',
  ghost: 'bg-transparent hover:bg-black/5 text-[var(--text)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  className = '',
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...rest
}, ref) {
  const base = 'py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 flex items-center justify-center focus:ring-[var(--focus)]';
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <div className="flex items-center">
          <div className="h-5 w-5 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="ml-2">Загрузка...</span>
        </div>
      ) : children}
    </button>
  );
});


