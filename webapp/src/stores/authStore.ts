import { create } from 'zustand'
import { isAxiosError } from 'axios'
import { getAuthToken, setAuthToken } from '../lib/authToken'
import { api } from '../lib/api'

export interface PublicUser {
  id: number
  email: string
  name: string | null
  company: string | null
  role: string
}

interface AuthState {
  user: PublicUser | null
  token: string | null
  initialized: boolean
  error: string | null
  // Почему actions внутри стора, а не в компонентах: логин/выход меняют и токен,
  // и пользователя, и ошибку атомарно — из любого места UI одинаково.
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<boolean>
  logout: () => void
}

const readApiError = (e: unknown, fallback: string): string => {
  // Почему сужение через in вместо generic: тело ответа от сервера ненадёжно
  // (может быть пустым), проверяем shape в рантайме без unsafe assertion.
  if (isAxiosError(e)) {
    const data: unknown = e.response?.data
    if (typeof data === 'object' && data !== null && 'error' in data) {
      const nested: unknown = data.error
      if (typeof nested === 'object' && nested !== null && 'message' in nested && typeof nested.message === 'string') {
        return nested.message
      }
    }
  }
  return fallback
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: getAuthToken(),
  initialized: false,
  error: null,

  init: async () => {
    const token = getAuthToken()
    if (!token) {
      set({ initialized: true })
      return
    }
    try {
      const { data } = await api.get<{ user: PublicUser }>('/auth/me')
      set({ user: data.user, token, initialized: true, error: null })
    } catch {
      // Почему чистим токен: он протух или отозван — молча разлогиниваем вместо вечных 401.
      setAuthToken(null)
      set({ user: null, token: null, initialized: true })
    }
  },

  login: async (email, password) => {
    try {
      const { data } = await api.post<{ user: PublicUser; token: string }>('/auth/login', { email, password })
      setAuthToken(data.token)
      set({ user: data.user, token: data.token, error: null })
      return true
    } catch (e: unknown) {
      set({ error: readApiError(e, 'Не удалось войти') })
      return false
    }
  },

  register: async (email, password, name) => {
    try {
      const { data } = await api.post<{ user: PublicUser; token: string }>('/auth/register', { email, password, name })
      setAuthToken(data.token)
      set({ user: data.user, token: data.token, error: null })
      return true
    } catch (e: unknown) {
      set({ error: readApiError(e, 'Не удалось зарегистрироваться') })
      return false
    }
  },

  logout: () => {
    setAuthToken(null)
    set({ user: null, token: null, error: null })
  },
}))
