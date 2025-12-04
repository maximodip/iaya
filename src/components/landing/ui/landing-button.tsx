import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type LandingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const baseStyles =
  'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none tracking-wide'

const variantStyles: Record<NonNullable<LandingButtonProps['variant']>, string> =
  {
    primary:
      'bg-white text-black hover:bg-gray-200 border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10',
    outline:
      'border border-white/20 bg-transparent text-gray-300 hover:text-white hover:border-white/40',
    ghost: 'text-gray-400 hover:bg-white/5 hover:text-white',
  }

const sizeStyles: Record<NonNullable<LandingButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs font-mono',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

export const LandingButton = React.forwardRef<
  HTMLButtonElement,
  LandingButtonProps
>(({ className, variant = 'primary', size = 'md', asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  )
})

LandingButton.displayName = 'LandingButton'
