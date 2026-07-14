import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { AppSidebar } from '#/components/app-sidebar'
import { BrandMark } from '#/components/brand'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'
import { TooltipProvider } from '#/components/ui/tooltip'
import { listDreams } from '#/lib/dreams.functions'

export const Route = createFileRoute('/_app')({
  loader: () => listDreams(),
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { dreams, user } = Route.useLoaderData()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar dreams={dreams} user={user} />
        <SidebarInset className="min-w-0 bg-transparent">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/40 bg-background/80 px-4 backdrop-blur-xl md:hidden">
            <SidebarTrigger aria-label="Open navigation" />
            <Link
              to="/home"
              className="inline-flex items-center gap-2 font-display font-semibold"
            >
              <BrandMark className="size-7" />
              Dreamcatcher
            </Link>
          </header>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
