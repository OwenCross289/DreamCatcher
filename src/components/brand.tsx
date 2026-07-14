import { Link } from '@tanstack/react-router'
import { MoonStar } from 'lucide-react'

import { cn } from '#/lib/utils'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <span
        className={cn(
          'grid place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:-rotate-6',
          compact ? 'size-9' : 'size-11',
        )}
      >
        <MoonStar className={compact ? 'size-5' : 'size-6'} />
      </span>
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
