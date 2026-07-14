import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  Check,
  ChevronUp,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Search,
  Sun,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { BrandMark } from '#/components/brand'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '#/components/ui/sidebar'
import { authClient } from '#/lib/auth-client'
import { useTheme } from '#/components/theme-provider'
import { getMoodEmoji } from '#/lib/dream-options'
import type { Theme } from '#/components/theme-provider'

type SidebarDream = {
  id: string
  title: string
  dreamDate: string
  mood: string
}

type SidebarUser = {
  name: string
  email: string
  image?: string | null
}

const themeOptions: Array<{
  value: Theme
  label: string
  icon: typeof Sun
}> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const sidebarDateFormatter = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const searchableDateFormatter = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function dreamDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

export function AppSidebar({
  dreams,
  user,
}: {
  dreams: SidebarDream[]
  user: SidebarUser
}) {
  const location = useLocation()
  const { setOpenMobile } = useSidebar()
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase()

  const filteredDreams = useMemo(() => {
    if (!normalizedQuery) return dreams

    return dreams.filter((dream) => {
      const date = dreamDate(dream.dreamDate)
      const searchableText = [
        dream.title,
        dream.dreamDate,
        sidebarDateFormatter.format(date),
        searchableDateFormatter.format(date),
      ]
        .join(' ')
        .toLocaleLowerCase()

      return searchableText.includes(normalizedQuery)
    })
  }, [dreams, normalizedQuery])

  function closeMobileSidebar() {
    setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="gap-4 border-b border-sidebar-border/80 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Dreamcatcher"
              className="hover:bg-transparent data-active:bg-transparent"
              render={<Link to="/home" onClick={closeMobileSidebar} />}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-sidebar-border bg-[#f3eafb] p-1 shadow-sm shadow-primary/10 dark:border-white/15 dark:bg-[#e7eaf7] dark:shadow-black/25">
                <BrandMark className="size-full" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Dreamcatcher
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sidebar-foreground/55" />
          <SidebarInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search dreams by name or date"
            placeholder="Search dreams or days..."
            className="h-10 rounded-xl border-sidebar-border/80 bg-sidebar-accent/45 pr-3 pl-9 text-sidebar-foreground shadow-sm placeholder:text-sidebar-foreground/45 focus-visible:border-sidebar-primary/60 focus-visible:ring-sidebar-ring/25"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="pt-3 pb-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Capture a dream"
                  className="h-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground"
                  isActive={location.pathname === '/dreams/new'}
                  render={
                    <Link to="/dreams/new" onClick={closeMobileSidebar} />
                  }
                >
                  <Plus />
                  <span>Capture a dream</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-0">
          <SidebarGroupLabel>
            {normalizedQuery ? 'Search results' : 'Your dreams'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredDreams.map((dream) => {
                const path = `/dreams/${dream.id}`
                return (
                  <SidebarMenuItem key={dream.id}>
                    <SidebarMenuButton
                      size="lg"
                      tooltip={`${dream.title} · ${sidebarDateFormatter.format(dreamDate(dream.dreamDate))}`}
                      isActive={location.pathname === path}
                      render={
                        <Link
                          to="/dreams/$dreamId"
                          params={{ dreamId: dream.id }}
                          onClick={closeMobileSidebar}
                        />
                      }
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-4 shrink-0 items-center justify-center text-base leading-none"
                      >
                        {getMoodEmoji(dream.mood)}
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block truncate font-medium">
                          {dream.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                          {sidebarDateFormatter.format(
                            dreamDate(dream.dreamDate),
                          )}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>

            {filteredDreams.length === 0 && (
              <p className="px-2 py-6 text-center text-xs leading-relaxed text-muted-foreground">
                {dreams.length === 0
                  ? 'Your captured dreams will appear here.'
                  : `No dreams match “${query.trim()}”.`}
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <UserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}

function UserMenu({ user }: { user: SidebarUser }) {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function signOut() {
    setIsSigningOut(true)
    await authClient.signOut()
    await navigate({ to: '/sign-in' })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar size="sm" className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>
                {user.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1 text-left leading-tight">
              <span className="block truncate font-medium">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
            <ChevronUp className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-60"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              {themeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                  >
                    <Icon />
                    {option.label}
                    {theme === option.value && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isSigningOut}
              onClick={signOut}
            >
              <LogOut />
              {isSigningOut ? 'Signing out...' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
