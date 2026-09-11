import { Link, Outlet } from 'react-router-dom'
import { getCatalogRoute, getObjectSelectRoute, getProjectsRoute } from '../../lib/routes'
import css from './index.module.scss'

export const Layout = () => (
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
    </div>
    <div className={css.content}>
      <Outlet />
    </div>
  </div>
)
