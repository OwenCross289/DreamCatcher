import { createFileRoute } from '@tanstack/react-router'
import { Cloud, LoaderCircle, LockKeyhole, Sparkles, Stars } from 'lucide-react'
import { useState } from 'react'

import { Brand } from '#/components/brand'
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function signIn() {
    setIsLoading(true)
    setError('')
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    })

    if (result.error) {
      setError('This Google account is not invited to this journal.')
      setIsLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#29213f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(194,142,221,0.35),transparent_35%),radial-gradient(circle_at_75%_70%,rgba(89,115,190,0.35),transparent_35%)]" />
        <Stars className="absolute top-[18%] left-[17%] size-7 text-[#f8db9c]" />
        <Sparkles className="absolute top-[28%] right-[22%] size-5 text-[#e6c8ff]" />
        <Cloud className="absolute right-[12%] bottom-[24%] size-20 text-white/10" />
        <div className="relative text-white [&_span]:text-white">
          <Brand />
        </div>
        <div className="relative max-w-xl pb-16">
          <div className="animate-float mb-12 grid size-32 place-items-center rounded-full bg-[#f5dfad] shadow-[0_0_100px_rgba(245,223,173,0.28)]">
            <span className="translate-x-3 text-7xl text-[#403458]">☾</span>
          </div>
          <p className="font-display text-5xl leading-[1.06] tracking-[-0.03em]">
            “Dreams are illustrations from the book your soul is writing.”
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.24em] text-white/50">
            A tiny universe for two
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md border-white/70 bg-white/65">
          <CardContent className="p-7 sm:p-10">
            <div className="mb-9 lg:hidden">
              <Brand />
            </div>
            <div className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
              <LockKeyhole className="size-5" />
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
              Welcome to your dreams
            </h1>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              This is a private journal. Sign in with one of the two invited
              Google accounts to continue.
            </p>

            <Button
              variant="outline"
              size="lg"
              className="mt-8 w-full bg-white/80"
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
                className="mt-4 text-center text-sm font-medium text-destructive"
              >
                {error}
              </p>
            )}

            <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
              Your entries and illustrations are only visible to you. They are
              never used for public sharing.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
