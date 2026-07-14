import { ImageOff, LoaderCircle, WandSparkles } from 'lucide-react'

import { cn } from '#/lib/utils'

export function DreamArtwork({
  dreamId,
  title,
  status,
  className,
}: {
  dreamId: string
  title: string
  status: 'generating' | 'ready' | 'failed'
  className?: string
}) {
  if (status === 'ready') {
    return (
      <img
        src={`/api/dreams/${dreamId}/image`}
        alt={`AI illustration for ${title}`}
        className={cn('h-full w-full object-cover', className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'dream-image flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-foreground/70',
        className,
      )}
    >
      {status === 'generating' ? (
        <LoaderCircle className="size-9 animate-spin text-primary" />
      ) : (
        <ImageOff className="size-9 text-primary" />
      )}
      <div>
        <p className="font-display text-lg font-semibold text-foreground">
          {status === 'generating'
            ? 'Painting your dream…'
            : 'The picture faded'}
        </p>
        <p className="mt-1 text-xs">
          {status === 'generating'
            ? 'A little moonlight is still at work.'
            : 'Open this dream to try creating it again.'}
        </p>
      </div>
      {status === 'generating' && <WandSparkles className="size-4" />}
    </div>
  )
}
