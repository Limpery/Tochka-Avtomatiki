import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Header } from '../Header'
import { getLoginRoute } from '../../lib/routes'
import css from './index.module.scss'

// Почему guard на уровне Layout: все приватные разделы (проекты, сравнения)
// лежат под ним, каталог и объект остаются публичными через отдельные ветки App.
export const RequireAuth = () => {
  const { token, initialized, init } = useAuthStore()
  useEffect(() => {
    if (!initialized) {
      void init()
    }
  }, [initialized, init])
  if (!initialized) {
    return <div className={css.loading}>Загрузка…</div>
  }
  return token ? <Outlet /> : <Navigate to={getLoginRoute()} replace />
}

// Почему header здесь: шапка с поиском и auth-блоком общая для всех страниц,
// контент меняется в Outlet под ней.
export const Layout = () => (
  <div className={css.layout}>
    <Header />
    <main className={css.content}>
      <Outlet />
    </main>
  </div>
)
