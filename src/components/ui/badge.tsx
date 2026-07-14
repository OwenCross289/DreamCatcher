import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-primary/12 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-border bg-background/50 text-foreground',
        destructive: 'bg-destructive/12 text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
