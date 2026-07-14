import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

import { AppHeader } from '#/components/app-header'
import { DreamArtwork } from '#/components/dream-artwork'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import {
  deleteDream,
  getDream,
  regenerateDreamImage,
} from '#/lib/dreams.functions'
import { getMoodEmoji } from '#/lib/dream-options'
import { getViewer } from '#/lib/session.functions'

export const Route = createFileRoute('/dreams/$dreamId')({
  loader: async ({ params }) => {
    const [dream, user] = await Promise.all([
      getDream({ data: { dreamId: params.dreamId } }),
      getViewer(),
    ])
    return { dream, user }
  },
  component: DreamDetail,
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function DreamDetail() {
  const { dream, user } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [action, setAction] = useState<'regenerate' | 'delete' | null>(null)

  async function regenerate() {
    setAction('regenerate')
    await regenerateDreamImage({ data: { dreamId: dream.id } })
    await router.invalidate()
    setAction(null)
  }

  async function remove() {
    if (!window.confirm('Delete this dream and its artwork forever?')) return
    setAction('delete')
    await deleteDream({ data: { dreamId: dream.id } })
    await navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen pb-16">
      <AppHeader user={user} />
      <main className="dream-shell max-w-5xl">
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="-ml-4">
            <Link to="/">
              <ArrowLeft />
              Back to the journal
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={action !== null}
            onClick={remove}
          >
            {action === 'delete' ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Trash2 />
            )}
            Delete dream
          </Button>
        </div>

        <article className="mt-6">
          <Card className="overflow-hidden bg-white/65">
            <div className="aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
              <DreamArtwork
                dreamId={dream.id}
                title={dream.title}
                status={dream.imageStatus}
              />
            </div>
            <CardContent className="p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>
                  {getMoodEmoji(dream.mood)} {dream.mood}
                </Badge>
                <Badge variant="secondary">{dream.visualStyle}</Badge>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {formatDate(dream.dreamDate)}
                </span>
              </div>

              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                {dream.title}
              </h1>
              <div className="mt-7 whitespace-pre-wrap text-base leading-8 text-foreground/80">
                {dream.content}
              </div>

              {dream.imageStatus === 'failed' && (
                <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold">
                      The illustration could not be created
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {dream.imageError ??
                        'Your words are safe. Try the picture again.'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={regenerate}
                    disabled={action !== null}
                  >
                    {action === 'regenerate' ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <RefreshCw />
                    )}
                    Try again
                  </Button>
                </div>
              )}

              {dream.imageStatus === 'ready' && (
                <div className="mt-9 flex items-center justify-between gap-4 border-t pt-6">
                  <p className="text-xs text-muted-foreground">
                    Illustrated with {dream.imageModel ?? 'OpenAI'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={regenerate}
                    disabled={action !== null}
                  >
                    {action === 'regenerate' ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <RefreshCw />
                    )}
                    Reimagine
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  )
}
