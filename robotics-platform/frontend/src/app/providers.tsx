'use client'

import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { makeQueryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth-store'

export function Providers({ children }: { children: React.ReactNode }) {
  // Почему useState: клиент создаётся один раз на жизнь приложения в браузере.
  const [queryClient] = useState(makeQueryClient)

  // Восстанавливаем токен из localStorage после монтирования (persist настроен с skipHydration).
  useEffect(() => {
    void useAuthStore.persist.rehydrate()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
