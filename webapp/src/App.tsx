import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TrpcProvider } from './lib/trpc'
import * as routes from './lib/routes'
import { AllRobotsPage } from './pages/AllRobotsPage'
import { ViewRobotPage } from './pages/ViewRobotPage'
import { Layout } from './components/Layout'
import { NewRobotPage } from './pages/NewRobotPage'
import './styles/global.scss'

export const App = () => (
  <TrpcProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={routes.getAllRobotsRoute()} element={<AllRobotsPage />} />
          <Route path={routes.getNewRobotRoute()} element={<NewRobotPage />} />
          <Route path={routes.getViewRobotRoute(routes.viewRobotRouteParams.nameRobot)} element={<ViewRobotPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TrpcProvider>
)
