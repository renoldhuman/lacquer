'use client'

import { ReactNode } from 'react'

type CapsuleVariant = 
  | 'completed'      // Green filled
  | 'due-date'       // Orange filled
  | 'due-date-empty' // Dashed border, transparent
  | 'note'           // Zinc filled
  | 'note-empty'     // Dashed border, transparent
  | 'project'        // Black filled
  | 'location'       // Blue filled
  | 'priority'       // Zinc filled

interface CapsuleProps {
  variant: CapsuleVariant
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  title?: string
  as?: 'button' | 'div' | 'span'
  active?: boolean
}

const variantStyles: Record<CapsuleVariant, string> = {
  'completed': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  'due-date': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  'due-date-empty': 'border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600',
  'note': 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
  'note-empty': 'border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600',
  'project': 'bg-black text-white',
  'location': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  'priority': 'bg-zinc-100 dark:bg-zinc-800',
}

export function Capsule({
  variant,
  children,
  onClick,
  className = '',
  disabled = false,
  title,
  as = 'div',
  active = false,
}: CapsuleProps) {
  const baseStyles = 'px-2 py-1 rounded-full flex items-center gap-1.5 h-6 text-sm'
  const variantStyle = variantStyles[variant]
  
  // Additional styles based on variant and props
  let additionalStyles = ''
  
  if (onClick && !disabled) {
    additionalStyles += ' cursor-pointer transition-colors'
  }
  
  if (variant === 'due-date' && onClick) {
    additionalStyles += ' hover:opacity-80 transition-opacity'
  }
  
  if (variant === 'project' && onClick) {
    additionalStyles += active 
      ? ' ring-2 ring-zinc-400 dark:ring-zinc-600' 
      : ' hover:opacity-80 transition-opacity'
  }
  
  if (variant === 'location' && onClick) {
    additionalStyles += active
      ? ' ring-2 ring-blue-400 dark:ring-blue-600'
      : ' hover:opacity-80 transition-opacity'
  }

  const combinedClassName = `${baseStyles} ${variantStyle} ${additionalStyles} ${className}`.trim()

  if (as === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={combinedClassName}
        title={title}
      >
        {children}
      </button>
    )
  }

  if (as === 'span') {
    return (
      <span className={combinedClassName} title={title}>
        {children}
      </span>
    )
  }

  return (
    <div className={combinedClassName} onClick={onClick} title={title}>
      {children}
    </div>
  )
}

