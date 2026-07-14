import { createFileRoute } from '@tanstack/react-router'
import {
  Cloud,
  LoaderCircle,
  LockKeyhole,
  Moon,
  Sparkles,
  Stars,
  Sun,
} from 'lucide-react'
import { useState } from 'react'

import { Brand, BrandMark } from '#/components/brand'
import { useTheme } from '#/components/theme-provider'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/sign-in')({ component: SignIn })

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4h5.4a4.7 4.7 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4L15.4 17c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.7A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.9a6 6 0 0 1 0-3.8V7.4H3a10 10 0 0 0 0 9.2l3.4-2.7Z"
      />
      <path
        fill="#EA4335"
        d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9 5.4l3.4 2.7C7.2 7.8 9.4 6 12 6Z"
      />
    </svg>
  )
}

function SignIn() {
  const { setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function signIn() {
    setIsLoading(true)
    setError('')
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/home',
    })

    if (result.error) {
      setError('This Google account is not invited to this journal.')
      setIsLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-svh overflow-hidden lg:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)]">
      <section className="relative hidden min-h-svh overflow-hidden bg-[#2d2544] p-12 text-white lg:flex lg:flex-col lg:justify-between dark:bg-[#181525] xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_16%,rgba(197,146,224,0.34),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(100,125,196,0.32),transparent_38%)] dark:bg-[radial-gradient(circle_at_24%_16%,rgba(179,121,211,0.25),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(75,94,153,0.25),transparent_38%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_0_1px,transparent_1.4px)] [background-size:7rem_7rem] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <Stars className="absolute top-[18%] left-[17%] size-7 text-[#f8db9c]" />
        <Sparkles className="absolute top-[29%] right-[21%] size-5 text-[#e6c8ff]" />
        <Cloud className="absolute right-[10%] bottom-[18%] size-24 text-white/[0.06]" />

        <div className="relative [&_span]:text-white">
          <Brand />
        </div>

        <div className="relative max-w-2xl pb-10 xl:pb-16">
          <div className="animate-float mb-10 grid size-28 place-items-center rounded-full bg-[#f5dfad] shadow-[0_0_100px_rgba(245,223,173,0.28)] xl:size-32">
            <span className="translate-x-2 text-6xl text-[#403458] xl:text-7xl">
              ☾
            </span>
          </div>
          <blockquote className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-balance xl:text-5xl">
            “Dreams are illustrations from the book your soul is writing.”
          </blockquote>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
            Your private dream journal
          </p>
        </div>
      </section>

      <section className="relative flex min-h-svh items-center justify-center px-5 py-20 sm:px-10 lg:px-12">
        <div className="absolute top-5 right-5 sm:top-7 sm:right-7">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle color theme"
            title="Toggle color theme"
            onClick={() =>
              setTheme(
                document.documentElement.classList.contains('dark')
                  ? 'light'
                  : 'dark',
              )
            }
            className="rounded-full border border-border/60 bg-background/50 text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
          >
            <Sun className="hidden dark:block" />
            <Moon className="dark:hidden" />
          </Button>
        </div>

        <div className="w-full max-w-[27rem]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Brand />
          </div>

          <Card className="border-border/75 bg-card/80 shadow-[0_28px_90px_-38px_rgba(52,35,77,0.48)] dark:bg-card/72 dark:shadow-[0_28px_90px_-38px_rgba(0,0,0,0.72)]">
            <CardContent className="p-7 sm:p-9">
              <div className="grid size-12 place-items-center rounded-2xl border border-primary/10 bg-primary/10 text-primary shadow-sm">
                <LockKeyhole className="size-5" />
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold text-primary">
                  Private journal
                </p>
                <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.025em] text-balance">
                  Welcome back to your dreams
                </h1>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  Continue with an invited Google account to open your journal.
                </p>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="mt-8 w-full border-border/80 bg-background/75 shadow-sm hover:border-primary/25 hover:bg-accent dark:bg-background/45"
                onClick={signIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {isLoading ? 'Opening your journal…' : 'Continue with Google'}
              </Button>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl bg-destructive/10 px-3 py-2.5 text-center text-sm font-medium text-destructive"
                >
                  {error}
                </p>
              )}

              <div className="mt-7 flex items-start gap-3 border-t border-border/70 pt-6">
                <BrandMark className="mt-0.5 size-7 shrink-0 opacity-75" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your dreams and illustrations stay private and are never
                  shared publicly.
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="mt-5 text-center text-xs text-muted-foreground/75">
            A quiet place for the worlds you visit while asleep.
          </p>
        </div>
      </section>
    </main>
  )
}
