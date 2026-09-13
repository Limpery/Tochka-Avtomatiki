import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import type { ApiErrorBody } from '@/types'

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Почему getState, а не хук: interceptor живёт вне React-дерева.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 означает протухший/невалидный токен — разлогиниваем и отправляем на /login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register')
    if (error.response?.status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      useAuthStore.getState().logout()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/** Достаёт человекочитаемое сообщение из ошибки API единого формата { error: { code, message } } */
export function getApiErrorMessage(error: unknown, fallback = 'Что-то пошло не так'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data
    if (body?.error?.message) {
      const details = body.error.details
      if (Array.isArray(details) && details.length > 0) {
        const first = details[0] as { path?: string; message?: string }
        if (first.message) {
          return first.path ? `${first.path}: ${first.message}` : first.message
        }
      }
      return body.error.message
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Не удалось связаться с сервером. Проверьте, что backend запущен.'
    }
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

export function getApiErrorCode(error: unknown): string | null {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.code ?? null
  }
  return null
}
