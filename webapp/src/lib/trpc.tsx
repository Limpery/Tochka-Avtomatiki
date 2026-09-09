import type { TrpcRouter } from '@memmemory/backend/src/router'
import { createTRPCReact } from '@trpc/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'

// eslint-disable-next-line react-refresh/only-export-components
export const trpc = createTRPCReact<TrpcRouter>()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // не нужно перезапрашивать запрос, если есть ошибка
      refetchOnWindowFocus: false, // Новый запрос данных при выходе из фокуса окна
    },
  },
})

const trpcClient = trpc.createClient({
  // trpcClient
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_BACKEND_TRPC_URL ?? 'http://localhost:3000/trpc', // URL для запросов к серверу TRPC
    }),
  ],
})

export const TrpcProvider = ({ children }: { children: React.ReactNode }) => (
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </trpc.Provider>
)
