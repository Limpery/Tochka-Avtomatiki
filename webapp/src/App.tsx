import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TrpcProvider } from './lib/trpc'
import { Layout, RequireAuth } from './components/Layout'
import { HomeCatalogPage } from './pages/HomeCatalogPage'
import { ObjectSelectPage } from './pages/ObjectSelectPage'
import { CatalogPage } from './pages/CatalogPage'
import { SolutionDetailPage } from './pages/SolutionDetailPage'
import { ComparePage } from './pages/ComparePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectPage } from './pages/ProjectPage'
import { SimulationPage } from './pages/SimulationPage'
import { AuthPage } from './pages/AuthPage'
import './styles/global.scss'

export const App = () => (
  <TrpcProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeCatalogPage />} />
          <Route path="/new-project" element={<ObjectSelectPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/solutions/:slug" element={<SolutionDetailPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          {/* Почему проекты под RequireAuth: это пользовательские данные,
              а каталог и выбор объекта остаются публичными для витрины. */}
          <Route element={<RequireAuth />}>
            <Route path="/compare/:id" element={<ComparePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/projects/:id/simulation" element={<SimulationPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </TrpcProvider>
)
