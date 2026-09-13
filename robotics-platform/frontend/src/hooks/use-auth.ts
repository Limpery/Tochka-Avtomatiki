'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import type { AuthResponse, User } from '@/types'

interface RegisterInput {
  email: string
  password: string
  name?: string
  company?: string
}

interface LoginInput {
  email: string
  password: string
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()
  return useMutation({
    mutationFn: async (input: LoginInput) => (await api.post<AuthResponse>('/auth/login', input)).data,
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      router.replace('/')
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const router = useRouter()
  return useMutation({
    mutationFn: async (input: RegisterInput) => (await api.post<AuthResponse>('/auth/register', input)).data,
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      router.replace('/')
    },
  })
}

export function useMe() {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)
  return useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      const user = (await api.get<User>('/auth/me')).data
      setUser(user)
      return user
    },
    enabled: Boolean(token),
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()
  const router = useRouter()
  return () => {
    logout()
    // Почему clear: кэш проектов/сравнений принадлежит пользователю, следующему его видеть нельзя.
    queryClient.clear()
    router.replace('/login')
  }
}
