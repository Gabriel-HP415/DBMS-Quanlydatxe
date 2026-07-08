import { cn } from '../../lib/utils'

interface IconProps {
  name: string
  className?: string
  filled?: boolean
  size?: number
}

export function Icon({ name, className, filled, size }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'fill', className)}
      style={size ? { fontSize: size } : undefined}
    >
      {name}
    </span>
  )
}