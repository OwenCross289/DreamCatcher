import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, Plus } from 'lucide-react'
import { useState } from 'react'

import { Brand } from '#/components/brand'
import { Button, buttonVariants } from '#/components/ui/button'
import { authClient } from '#/lib/auth-client'
import { cn } from '#/lib/utils'

export function AppHeader({
  user,
}: {
  user: { name: string; email: string; image?: string | null }
}) {
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    setIsSigningOut(true)
    await authClient.signOut()
    await navigate({ to: '/sign-in' })
  }

  return (
    <header className="dream-shell flex items-center justify-between gap-4 py-6">
      <Brand compact />
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/dreams/new"
          className={cn(
            buttonVariants({ size: 'sm' }),
            'hidden sm:inline-flex',
          )}
        >
          <Plus />
          Capture a dream
        </Link>
        <div className="hidden text-right md:block">
          <p className="max-w-40 truncate text-sm font-semibold">{user.name}</p>
          <p className="max-w-40 truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
        {user.image ? (
          <img
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
            className="size-9 rounded-full border-2 border-white object-cover shadow-sm"
          />
        ) : (
          <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-bold">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          title="Sign out"
          disabled={isSigningOut}
          onClick={signOut}
        >
          <LogOut />
        </Button>
      </div>
    </header>
  )
}
