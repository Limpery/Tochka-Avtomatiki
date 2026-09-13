import { QueryClient } from '@tanstack/react-query'

// Почему фабрика: в App Router клиент должен создаваться один раз на браузер (useState в providers),
// иначе кэш сбрасывается при каждом рендере провайдера.
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}
