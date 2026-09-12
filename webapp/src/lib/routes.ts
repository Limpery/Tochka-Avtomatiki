export const getHomeRoute = () => '/'

export const getObjectSelectRoute = () => '/new-project'

export const getCatalogRoute = (params?: { industry?: string; objectType?: string }) => {
  const q = new URLSearchParams()
  if (params?.industry) {
    q.set('industry', params.industry)
  }
  if (params?.objectType) {
    q.set('objectType', params.objectType)
  }
  const s = q.toString()
  return s ? `/catalog?${s}` : '/catalog'
}

export const getSolutionRoute = (slug: string, projectId?: number) =>
  projectId ? `/solutions/${slug}?projectId=${projectId}` : `/solutions/${slug}`

export const getCompareRoute = (id: number) => `/compare/${id}`

export const getProjectsRoute = () => '/projects'

export const getLoginRoute = () => '/login'

export const getRegisterRoute = () => '/register'

export const getProjectRoute = (id: number) => `/projects/${id}`

export const getSimulationRoute = (projectId: number, solutionId?: number) =>
  solutionId ? `/projects/${projectId}/simulation?solutionId=${solutionId}` : `/projects/${projectId}/simulation`
