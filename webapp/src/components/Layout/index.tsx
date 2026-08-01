import { Link, Outlet } from 'react-router-dom'
import { getAllMemesRoute } from '../../lib/routes'
import css from './index.module.scss'

export const Layout = () => (
  <div className={css.layout}>
    <div className={css.navigation}>
      <div className={css.logo}>Memmemory</div>
      <ul className={css.menu}>
        <li className={css.item}>
          <Link className={css.link} to={getAllMemesRoute()}>
            All Memes
          </Link>
        </li>
      </ul>
    </div>
    <div className={css.content}>
      <Outlet />
    </div>
  </div>
)
