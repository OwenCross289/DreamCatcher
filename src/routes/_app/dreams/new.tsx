import {
  Link,
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { ArrowLeft, LoaderCircle, MoonStar, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { Badge } from '#/components/ui/badge'
import { Button, buttonVariants } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { createDream, generateDreamImageForDream } from '#/lib/dreams.functions'
import { moodEmoji, moods, visualStyles } from '#/lib/dream-options'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/_app/dreams/new')({
  component: NewDream,
})

function todayForInput() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

function NewDream() {
  const navigate = useNavigate()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function imagineDream(dreamId: string) {
    try {
      await generateDreamImageForDream({ data: { dreamId } })
    } catch {
      // The dream is already safe; the detail page will show its latest state.
    } finally {
      await router.invalidate()
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    const form = new FormData(event.currentTarget)

    try {
      const created = await createDream({
        data: {
          title: String(form.get('title')),
          content: String(form.get('content')),
          dreamDate: String(form.get('dreamDate')),
          mood: String(form.get('mood')) as (typeof moods)[number],
          visualStyle: String(
            form.get('visualStyle'),
          ) as (typeof visualStyles)[number],
        },
      })
      await navigate({
        to: '/dreams/$dreamId',
        params: { dreamId: created.id },
      })
      void router.invalidate()
      void imagineDream(created.id)
    } catch {
      setError(
        'Your dream could not be saved. Please check the details and try again.',
      )
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-svh pb-16">
      <main className="dream-shell max-w-5xl">
        <Link
          to="/home"
          aria-label="Back to the journal"
          title="Back to the journal"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'mt-5 text-muted-foreground hover:text-foreground sm:mt-7',
          )}
        >
          <ArrowLeft />
        </Link>

        <div className="mt-7 max-w-2xl sm:mt-10">
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/8 text-primary"
          >
            <MoonStar className="size-3.5" />A new memory from the night
          </Badge>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            What did you dream?
          </h1>
          <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
            Write down everything you can remember. The odd details often make
            the most magical pictures.
          </p>
        </div>

        <Card className="mt-8 border-border/80 bg-card/90 sm:mt-10">
          <CardContent className="p-5 sm:p-8 lg:p-10">
            <form onSubmit={submit} className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-[1fr_12rem]">
                <div className="space-y-2">
                  <Label htmlFor="title">Give your dream a name</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    maxLength={120}
                    placeholder="The city above the clouds"
                    autoFocus
                    className="bg-background/75"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dreamDate">When was it?</Label>
                  <Input
                    id="dreamDate"
                    name="dreamDate"
                    type="date"
                    defaultValue={todayForInput()}
                    required
                    className="bg-background/75"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Tell the story</Label>
                <Textarea
                  id="content"
                  name="content"
                  required
                  minLength={20}
                  maxLength={6000}
                  className="min-h-48 bg-background/75"
                  placeholder="I was walking through a quiet city where every window opened onto a different sky…"
                />
                <p className="text-xs text-muted-foreground">
                  People, places, colours, weather, feelings — include whatever
                  stayed with you.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mood">How did it feel?</Label>
                  <select
                    id="mood"
                    name="mood"
                    defaultValue="mysterious"
                    className="h-11 w-full rounded-2xl border border-input bg-background/75 px-4 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
                  >
                    {moods.map((mood) => (
                      <option key={mood} value={mood}>
                        {moodEmoji[mood]}{' '}
                        {mood[0].toUpperCase() + mood.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visualStyle">Picture it as</Label>
                  <select
                    id="visualStyle"
                    name="visualStyle"
                    defaultValue="storybook"
                    className="h-11 w-full rounded-2xl border border-input bg-background/75 px-4 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
                  >
                    {visualStyles.map((style) => (
                      <option key={style} value={style}>
                        {style[0].toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm font-medium text-destructive"
                >
                  {error}
                </p>
              )}

              <div className="flex justify-end border-t border-border/70 pt-7">
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <WandSparkles />
                  )}
                  {isSaving ? 'Saving dream…' : 'Imagine Dream'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
