import { useEffect } from 'react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { getCatalogRoute, getLoginRoute, getObjectSelectRoute, getProjectsRoute } from '../../lib/routes'
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
    return <div>Загрузка...</div>
  }
  return token ? <Outlet /> : <Navigate to={getLoginRoute()} replace />
}

export const Layout = () => {
  const { user, logout } = useAuthStore()
  return (
    <div className={css.layout}>
      <div className={css.navigation}>
        <div className={css.logo}>Точка Автоматики</div>
        <ul className={css.menu}>
          <li className={css.item}>
            <Link className={css.link} to={getObjectSelectRoute()}>
              1. Объект
            </Link>
          </li>
          <li className={css.item}>
            <Link className={css.link} to={getCatalogRoute()}>
              2. Решения
            </Link>
          </li>
          <li className={css.item}>
            <Link className={css.link} to={getProjectsRoute()}>
              3. Проекты и экономика
            </Link>
          </li>
        </ul>
        <div>
          {user ? (
            <span>
              {user.email}{' '}
              <button
                type="button"
                onClick={() => {
                  logout()
                }}
              >
                Выйти
              </button>
            </span>
          ) : (
            <Link className={css.link} to={getLoginRoute()}>
              Войти
            </Link>
          )}
        </div>
      </div>
      <div className={css.content}>
        <Outlet />
      </div>
    </div>
  )
}
