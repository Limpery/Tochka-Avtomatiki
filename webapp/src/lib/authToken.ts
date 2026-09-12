// Почему один ключ и helpers: токен читают и tRPC-link, и axios, и стор —
// точка доступа единая, чтобы не разъехались (например, logout чистит везде).

const TOKEN_KEY = 'tochka-auth-token'

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    // Почему try/catch: SSR/prerender без localStorage не должен ронять приложение.
    return null
  }
}

export const setAuthToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // Почему молчим: отсутствие storage — не фатально, сессия просто не переживёт reload.
  }
}
