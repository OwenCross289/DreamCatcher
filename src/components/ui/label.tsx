import * as React from 'react'

import { cn } from '#/lib/utils'

function Label({
  className,
  children,
  htmlFor,
  ...props
}: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      htmlFor={htmlFor}
      className={cn('text-sm font-semibold text-foreground', className)}
      {...props}
    >
      {children}
    </label>
  )
}

export { Label }
