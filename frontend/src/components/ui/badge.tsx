import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'danger' | 'warning' | 'default' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variant === 'success' && 'bg-green-100 text-green-800',
      variant === 'danger' && 'bg-red-100 text-red-800',
      variant === 'warning' && 'bg-yellow-100 text-yellow-800',
      variant === 'info' && 'bg-blue-100 text-blue-800',
      variant === 'default' && 'bg-surface-container text-on-surface-variant',
      className
    )}>
      {children}
    </span>
  )
}