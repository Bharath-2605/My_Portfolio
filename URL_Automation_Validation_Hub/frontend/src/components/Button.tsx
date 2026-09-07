import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/format'

type Variant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  icon?: ReactNode
  size?: 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  icon,
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cn('btn', `btn--${variant}`, size === 'lg' && 'btn--lg', className)} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  )
}
