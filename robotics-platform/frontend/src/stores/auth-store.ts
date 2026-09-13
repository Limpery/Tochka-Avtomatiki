import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  // Почему флаг гидратации: persist читает localStorage асинхронно после первого рендера,
  // без флага защищённые страницы редиректили бы на /login ещё до восстановления токена.
  hasHydrated: boolean
  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  logout: () => void
  setHasHydrated: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'robotics-platform-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      // Почему skipHydration: гидратируем вручную в useEffect (см. providers.tsx), чтобы первый
      // клиентский рендер совпадал с серверным и React не ругался на hydration mismatch.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
