'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

// Обратная защита: залогиненного пользователя со страниц входа отправляем на главную.
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  useEffect(() => {
    if (hasHydrated && token) {
      router.replace('/')
    }
  }, [hasHydrated, token, router])

  if (!hasHydrated || token) {
    return null
  }
  return <>{children}</>
}
