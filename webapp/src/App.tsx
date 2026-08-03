import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TrpcProvider } from './lib/trpc'
import * as routes from './lib/routes'
import { AllMemesPage } from './pages/AllMemesPage'
import { ViewMemePage } from './pages/ViewMemePage'
import { Layout } from './components/Layout'
import { NewMemPage } from './pages/NewMemPage'
import './styles/global.scss'

export const App = () => (
  <TrpcProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={routes.getAllMemesRoute()} element={<AllMemesPage />} />
          <Route path={routes.getNewMemeRoute()} element={<NewMemPage />} />
          <Route path={routes.getViewMemeRoute(routes.viewMemeRouteParams.nameMem)} element={<ViewMemePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TrpcProvider>
)
