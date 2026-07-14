import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, LoaderCircle, MoonStar, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { AppHeader } from '#/components/app-header'
import { Badge } from '#/components/ui/badge'
import { Button, buttonVariants } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { createDream } from '#/lib/dreams.functions'
import { moodEmoji, moods, visualStyles } from '#/lib/dream-options'
import { getViewer } from '#/lib/session.functions'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/dreams/new')({
  loader: () => getViewer(),
  component: NewDream,
})

function todayForInput() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10)
}

function NewDream() {
  const user = Route.useLoaderData()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

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
    } catch {
      setError(
        'Your dream could not be saved. Please check the details and try again.',
      )
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <AppHeader user={user} />
      <main className="dream-shell max-w-4xl">
        <Link
          to="/"
          className={cn(buttonVariants({ variant: 'ghost' }), '-ml-4 mt-3')}
        >
          <ArrowLeft />
          Back to the journal
        </Link>

        <div className="mt-8 text-center">
          <Badge variant="outline" className="bg-white/45">
            <MoonStar className="size-3.5" />A new memory from the night
          </Badge>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight">
            What did you dream?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Write down everything you can remember. The odd details often make
            the most magical pictures.
          </p>
        </div>

        <Card className="mt-10 bg-white/65">
          <CardContent className="p-6 sm:p-9">
            <form onSubmit={submit} className="space-y-7">
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
                    className="h-11 w-full rounded-2xl border border-input bg-background/65 px-4 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
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
                    className="h-11 w-full rounded-2xl border border-input bg-background/65 px-4 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
                  >
                    {visualStyles.map((style) => (
                      <option key={style} value={style}>
                        {style[0].toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-secondary/70 p-4 text-sm leading-relaxed text-secondary-foreground">
                <WandSparkles className="mr-2 inline size-4" />
                Saving will ask OpenAI to paint one private illustration
                inspired by your words. It can take a little while to finish.
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm font-medium text-destructive"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                  to="/"
                  aria-disabled={isSaving}
                  tabIndex={isSaving ? -1 : undefined}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    isSaving && 'pointer-events-none opacity-50',
                  )}
                >
                  Cancel
                </Link>
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <WandSparkles />
                  )}
                  {isSaving
                    ? 'Painting your dream…'
                    : 'Save dream & create artwork'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
