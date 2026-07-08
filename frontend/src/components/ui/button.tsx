import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 active:scale-[0.98]',
        variant === 'primary' && 'bg-primary-container text-on-primary hover:bg-primary shadow-sm',
        variant === 'secondary' && 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-high',
        variant === 'destructive' && 'text-error hover:bg-error-container',
        variant === 'ghost' && 'text-on-surface-variant hover:bg-surface-container-highest',
        size === 'sm' && 'px-3 py-1.5 text-xs uppercase tracking-wide',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-sm uppercase tracking-wide',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}