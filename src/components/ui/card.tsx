import * as React from 'react'

import { cn } from '#/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-[1.75rem] border border-border/70 bg-card/85 text-card-foreground shadow-[0_24px_80px_-40px_rgba(52,35,77,0.42)] backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-2 p-6', className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  children,
  ...props
}: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        'font-display text-2xl font-semibold tracking-tight',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6 pb-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 pb-6', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
