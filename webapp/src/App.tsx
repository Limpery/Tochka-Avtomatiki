import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TrpcProvider } from './lib/trpc'
import { getAllMemesRoute, getViewMemeRoute, viewMemeRouteParams } from './lib/routes'
import { AllMemesPage } from './pages/AllMemesPage'
import { ViewMemePage } from './pages/ViewMemePage'
import { Layout } from './components/Layout'
import './styles/global.scss'

export const App = () => (
  <TrpcProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={getAllMemesRoute()} element={<AllMemesPage />} />
          <Route path={getViewMemeRoute(viewMemeRouteParams.nameMem)} element={<ViewMemePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TrpcProvider>
)
