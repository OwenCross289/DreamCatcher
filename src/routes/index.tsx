import { Link, createFileRoute } from '@tanstack/react-router'
import { BookOpen, CalendarDays, Plus, Sparkles } from 'lucide-react'

import { AppHeader } from '#/components/app-header'
import { DreamArtwork } from '#/components/dream-artwork'
import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { listDreams } from '#/lib/dreams.functions'
import { getMoodEmoji } from '#/lib/dream-options'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({
  loader: () => listDreams(),
  pendingComponent: JournalLoading,
  component: Journal,
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function Journal() {
  const { dreams, user } = Route.useLoaderData()

  return (
    <div className="min-h-screen pb-24">
      <AppHeader user={user} />
      <main className="dream-shell">
        <section className="flex flex-col justify-between gap-6 py-8 sm:flex-row sm:items-end sm:py-12">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 bg-white/45">
              <Sparkles className="size-3.5" />
              Your private night sky
            </Badge>
            <h1 className="font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Dreams worth{' '}
              <span className="text-primary italic">remembering.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Keep the strange, beautiful worlds you visit after dark — each one
              reimagined as a piece of art.
            </p>
          </div>
          {dreams.length > 0 && (
            <div className="flex items-center gap-3 rounded-3xl border border-white/60 bg-white/40 px-5 py-4 backdrop-blur">
              <BookOpen className="size-5 text-primary" />
              <div>
                <p className="text-2xl font-bold leading-none">
                  {dreams.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dreams.length === 1 ? 'dream captured' : 'dreams captured'}
                </p>
              </div>
            </div>
          )}
        </section>

        {dreams.length === 0 ? (
          <EmptyJournal />
        ) : (
          <section
            aria-label="Dream journal"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {dreams.map((dream, index) => (
              <Link
                key={dream.id}
                to="/dreams/$dreamId"
                params={{ dreamId: dream.id }}
                className={index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}
              >
                <Card className="group h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-32px_rgba(52,35,77,0.55)]">
                  <div
                    className={
                      index === 0
                        ? 'aspect-[16/9] overflow-hidden sm:aspect-[2/1]'
                        : 'aspect-[4/3] overflow-hidden'
                    }
                  >
                    <DreamArtwork
                      dreamId={dream.id}
                      title={dream.title}
                      status={dream.imageStatus}
                      imageVersion={dream.updatedAt}
                      className="transition duration-700 group-hover:scale-[1.035]"
                    />
                  </div>
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge>
                        {getMoodEmoji(dream.mood)} {dream.mood}
                      </Badge>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {formatDate(dream.dreamDate)}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight transition group-hover:text-primary">
                      {dream.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {dream.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        )}
      </main>

      <Link
        to="/dreams/new"
        aria-label="Capture a dream"
        className={cn(
          buttonVariants({ size: 'icon' }),
          'fixed right-5 bottom-5 size-14 shadow-xl sm:hidden',
        )}
      >
        <Plus className="size-6" />
      </Link>
    </div>
  )
}

function EmptyJournal() {
  return (
    <Card className="relative overflow-hidden border-dashed py-8 text-center sm:py-14">
      <div className="absolute -top-10 -right-10 size-48 rounded-full bg-primary/10 blur-3xl" />
      <CardContent className="relative mx-auto max-w-lg px-6">
        <span className="animate-float mx-auto grid size-20 place-items-center rounded-[2rem] bg-secondary text-4xl shadow-lg">
          🌙
        </span>
        <h2 className="mt-7 font-display text-3xl font-semibold">
          Your journal is waiting
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Start with the dream that is still lingering at the edge of your
          morning. Describe whatever you remember — even the strange little
          details.
        </p>
        <Link
          to="/dreams/new"
          className={cn(buttonVariants({ size: 'lg' }), 'mt-7')}
        >
          <Plus />
          Capture your first dream
        </Link>
      </CardContent>
    </Card>
  )
}

function JournalLoading() {
  return (
    <main className="dream-shell grid min-h-screen place-items-center py-20">
      <div className="text-center">
        <Sparkles className="mx-auto size-9 animate-pulse text-primary" />
        <p className="mt-4 font-display text-2xl">Gathering your dreams…</p>
      </div>
    </main>
  )
}
