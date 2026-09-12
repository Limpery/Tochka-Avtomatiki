import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useCatalogFilterStore } from '../../stores/catalogFilterStore'
import { getHomeRoute, getLoginRoute, getProjectsRoute, getRegisterRoute } from '../../lib/routes'
import css from './index.module.scss'

// Почему header — обёртка, а не часть страниц: бренд, поиск и auth-блок
// одинаковы везде, страницы меняются только в Outlet под ним.
export const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const search = useCatalogFilterStore((s) => s.applied.search)
  const setSearch = useCatalogFilterStore((s) => s.setSearch)

  return (
    <header className={css.header}>
      <Link className={css.brand} to={getHomeRoute()}>
        <span className={css.brandMark}>ТА</span>
        <span className={css.brandName}>Точка Автоматики</span>
      </Link>
      <form
        className={css.searchForm}
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <input
          className={css.search}
          placeholder="Поиск роботизированных решений…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
        />
      </form>
      <nav className={css.auth}>
        {user ? (
          <>
            <button
              type="button"
              className={css.projectsBtn}
              onClick={() => {
                void navigate(getProjectsRoute())
              }}
            >
              Мои проекты
            </button>
            <span className={css.profile} title={user.email}>
              {user.name ?? user.email}
            </span>
            <button
              type="button"
              className={css.logoutBtn}
              onClick={() => {
                logout()
              }}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link className={css.loginLink} to={getLoginRoute()}>
              Войти
            </Link>
            <Link className={css.registerLink} to={getRegisterRoute()}>
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
