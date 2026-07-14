import { ImageOff, WandSparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'

export function DreamArtwork({
  dreamId,
  title,
  status,
  imageVersion,
  className,
}: {
  dreamId: string
  title: string
  status: 'generating' | 'ready' | 'failed'
  imageVersion: string
  className?: string
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  useEffect(() => {
    setIsImageLoaded(false)
  }, [dreamId, imageVersion, status])

  if (status === 'ready') {
    return (
      <div className={cn('relative h-full w-full', className)}>
        {!isImageLoaded && (
          <Skeleton className="absolute inset-0 size-full rounded-none" />
        )}
        <img
          src={`/api/dreams/${dreamId}/image?v=${encodeURIComponent(imageVersion)}`}
          alt={`AI illustration for ${title}`}
          onLoad={() => setIsImageLoaded(true)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            isImageLoaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>
    )
  }

  if (status === 'generating') {
    return (
      <output
        aria-label="Imagining your dream artwork"
        className={cn('relative block h-full w-full', className)}
      >
        <Skeleton aria-hidden="true" className="size-full rounded-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <WandSparkles
            aria-hidden="true"
            className="size-7 animate-pulse text-primary"
          />
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              Imagining your dream…
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your artwork is being created. This can take a little while.
            </p>
          </div>
        </div>
      </output>
    )
  }

  return (
    <div
      className={cn(
        'dream-image flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-foreground/70',
        className,
      )}
    >
      <ImageOff className="size-9 text-primary" />
      <div>
        <p className="font-display text-lg font-semibold text-foreground">
          The picture faded
        </p>
        <p className="mt-1 text-xs">
          Your dream is safe even though its artwork could not be created.
        </p>
      </div>
    </div>
  )
}
