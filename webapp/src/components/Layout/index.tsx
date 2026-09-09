import { Link, Outlet } from 'react-router-dom'
import { getAllRobotsRoute, getNewRobotRoute } from '../../lib/routes'
import css from './index.module.scss'

export const Layout = () => (
  <div className={css.layout}>
    <div className={css.navigation}>
      <div className={css.logo}>Tochka Avtomatiki</div>
      <ul className={css.menu}>
        <li className={css.item}>
          <Link className={css.link} to={getAllRobotsRoute()}>
            All Robots
          </Link>
        </li>
        <li className={css.item}>
          <Link className={css.link} to={getNewRobotRoute()}>
            Add Robot
          </Link>
        </li>
      </ul>
    </div>
    <div className={css.content}>
      <Outlet />
    </div>
  </div>
)
