import { Link } from '@tanstack/react-router'

import { cn } from '#/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/logo-mark.png?v=2"
      alt=""
      className={cn('block shrink-0 object-contain', className)}
    />
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/home" className="group inline-flex items-center gap-3">
      <BrandMark
        className={cn(
          'transition-transform group-hover:-rotate-6',
          compact ? 'size-9' : 'size-11',
        )}
      />
      <span
        className={cn(
          'font-display font-semibold tracking-tight text-foreground',
          compact ? 'text-xl' : 'text-2xl',
        )}
      >
        Dreamcatcher
      </span>
    </Link>
  )
}
