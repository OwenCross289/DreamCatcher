import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Plus,
  Shapes,
  Sparkles,
} from 'lucide-react'

import { DreamArtwork } from '#/components/dream-artwork'
import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { getMoodEmoji } from '#/lib/dream-options'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/_app/home')({
  pendingComponent: JournalLoading,
  component: Journal,
})

const appRoute = getRouteApi('/_app')

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function Journal() {
  const { dreams } = appRoute.useLoaderData()
  const typeCounts = dreams.reduce<Record<string, number>>((counts, dream) => {
    counts[dream.mood] = (counts[dream.mood] ?? 0) + 1
    return counts
  }, {})
  const dreamTypes = Object.entries(typeCounts).sort(
    ([typeA, countA], [typeB, countB]) =>
      countB - countA || typeA.localeCompare(typeB),
  )
  const mostCommonType = dreamTypes.at(0)

  return (
    <div className="min-h-svh pb-24">
      <main className="dream-shell">
        <section className="flex flex-col gap-5 py-8 sm:flex-row sm:items-end sm:justify-between sm:py-10">
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              Dream journal
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Overview
            </h1>
          </div>
          <Link
            to="/dreams/new"
            className={cn(
              buttonVariants(),
              'hidden self-start sm:inline-flex sm:self-auto',
            )}
          >
            <Plus />
            Add dream
          </Link>
        </section>

        <section
          aria-label="Dream statistics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <StatCard
            icon={BookOpen}
            label="Total dreams"
            value={dreams.length.toLocaleString('en')}
            detail={dreams.length === 1 ? 'Dream recorded' : 'Dreams recorded'}
          />
          <StatCard
            icon={Shapes}
            label="Dream types"
            value={dreamTypes.length.toLocaleString('en')}
            detail={
              dreamTypes.length > 0
                ? dreamTypes.map(([type]) => capitalize(type)).join(', ')
                : 'No types recorded'
            }
          />
          <StatCard
            icon={ChartNoAxesColumnIncreasing}
            label="Most common type"
            value={
              mostCommonType ? (
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">
                    {getMoodEmoji(mostCommonType[0])}
                  </span>
                  {capitalize(mostCommonType[0])}
                </span>
              ) : (
                '—'
              )
            }
            detail={
              mostCommonType
                ? `${mostCommonType[1]} ${mostCommonType[1] === 1 ? 'dream' : 'dreams'}`
                : 'No dreams recorded'
            }
            className="sm:col-span-2 xl:col-span-1"
          />
        </section>

        <section aria-labelledby="dream-list-heading" className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2
              id="dream-list-heading"
              className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Dreams
            </h2>
            <span className="text-sm text-muted-foreground">
              {dreams.length} {dreams.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {dreams.length === 0 ? (
            <Card>
              <EmptyJournal />
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {dreams.map((dream) => (
                <Link
                  key={dream.id}
                  to="/dreams/$dreamId"
                  params={{ dreamId: dream.id }}
                >
                  <Card className="group h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-32px_rgba(52,35,77,0.55)]">
                    <div className="aspect-[4/3] overflow-hidden">
                      <DreamArtwork
                        dreamId={dream.id}
                        title={dream.title}
                        status={dream.imageStatus}
                        imageVersion={dream.updatedAt}
                        className="transition duration-700 group-hover:scale-[1.035]"
                      />
                    </div>
                    <CardContent className="p-5 sm:p-6">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <Badge>
                          <span aria-hidden="true">
                            {getMoodEmoji(dream.mood)}
                          </span>
                          {capitalize(dream.mood)}
                        </Badge>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3.5" />
                          {formatDate(dream.dreamDate)}
                        </span>
                      </div>
                      <h3 className="line-clamp-2 h-16 font-display text-2xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {dream.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Link
        to="/dreams/new"
        aria-label="Add dream"
        className={cn(
          buttonVariants({ size: 'icon' }),
          'fixed right-5 bottom-5 z-20 size-14 shadow-xl sm:hidden',
        )}
      >
        <Plus className="size-6" />
      </Link>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  className,
}: {
  icon: typeof BookOpen
  label: string
  value: React.ReactNode
  detail: string
  className?: string
}) {
  return (
    <Card className={cn('min-w-0', className)}>
      <CardContent className="flex items-start gap-4 p-5 sm:p-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-1 truncate font-display text-3xl font-semibold tracking-tight">
            {value}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {detail}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyJournal() {
  return (
    <CardContent className="py-12 text-center sm:py-16">
      <BookOpen className="mx-auto size-8 text-muted-foreground" />
      <h3 className="mt-4 font-display text-2xl font-semibold">
        No dreams yet
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Add your first dream to start your journal.
      </p>
      <Link to="/dreams/new" className={cn(buttonVariants(), 'mt-6')}>
        <Plus />
        Add dream
      </Link>
    </CardContent>
  )
}

function JournalLoading() {
  return (
    <main className="dream-shell grid min-h-svh place-items-center py-20">
      <div className="text-center">
        <Sparkles className="mx-auto size-9 animate-pulse text-primary" />
        <p className="mt-4 font-display text-2xl">Loading your dreams…</p>
      </div>
    </main>
  )
}
