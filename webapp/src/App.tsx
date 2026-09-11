import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TrpcProvider } from './lib/trpc'
import { Layout } from './components/Layout'
import { ObjectSelectPage } from './pages/ObjectSelectPage'
import { CatalogPage } from './pages/CatalogPage'
import { SolutionDetailPage } from './pages/SolutionDetailPage'
import { ComparePage } from './pages/ComparePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectPage } from './pages/ProjectPage'
import { SimulationPage } from './pages/SimulationPage'
import './styles/global.scss'

export const App = () => (
  <TrpcProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ObjectSelectPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/solutions/:slug" element={<SolutionDetailPage />} />
          <Route path="/compare/:id" element={<ComparePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectPage />} />
          <Route path="/projects/:id/simulation" element={<SimulationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </TrpcProvider>
)
