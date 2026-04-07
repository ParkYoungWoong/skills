import * as React from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  // KB옐로우 위에는 검정 텍스트
  primary: 'bg-kb-yellow text-kb-black hover:bg-kb-yellow-strong active:scale-[0.98]',
  secondary: 'bg-line text-ink hover:bg-line-2 active:scale-[0.98]',
  ghost: 'bg-transparent text-ink-2 hover:bg-line',
  danger: 'bg-negative text-white hover:brightness-110 active:scale-[0.98]'
}

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-[8px]',
  md: 'h-12 px-5 text-[15px] rounded-[12px]',
  lg: 'h-14 px-6 text-[16px] rounded-[14px]'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        variantClass[variant]
      } ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}>
      {children}
    </button>
  )
}
