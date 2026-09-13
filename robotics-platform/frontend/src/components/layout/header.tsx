'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, FolderKanban, LayoutGrid, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useLogout } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/projects', label: 'Проекты', icon: FolderKanban },
  { href: '/catalog', label: 'Каталог', icon: LayoutGrid },
]

export function Header() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Bot className="size-6 text-primary" />
            <span className="hidden sm:inline">RoboSelect</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground md:inline">{user?.name ?? user?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
