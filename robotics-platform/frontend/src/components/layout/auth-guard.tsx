'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Skeleton } from '@/components/ui/skeleton'

// Клиентская защита: без токена — на /login. Серверные страницы данных не рендерят,
// поэтому «мигания» защищённого контента не будет.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace('/login')
    }
  }, [hasHydrated, token, router])

  if (!hasHydrated || !token) {
    return (
      <div className="container py-10">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return <>{children}</>
}
