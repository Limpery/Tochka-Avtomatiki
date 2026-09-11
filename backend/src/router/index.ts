import { trpc } from '../lib/trpc'
import { listIndustriesTrpcRoute } from './listIndustries'
import { listObjectTypesTrpcRoute } from './listObjectTypes'
import { listBenchmarksTrpcRoute } from './listBenchmarks'
import { listCatalogFiltersTrpcRoute } from './listCatalogFilters'
import { listSolutionsTrpcRoute } from './listSolutions'
import { getSolutionTrpcRoute } from './getSolution'
import { createProjectTrpcRoute } from './createProject'
import { listProjectsTrpcRoute } from './listProjects'
import { getProjectTrpcRoute } from './getProject'
import { getMatchesTrpcRoute } from './getMatches'
import { calculateEconomicsTrpcRoute } from './calculateEconomics'
import { getCalculationTrpcRoute } from './getCalculation'
import { comparisonsTrpcRouter } from './comparisons'
import { createRatingTrpcRoute, listCaseStudiesTrpcRoute } from './feedback'

export const trpcRouter = trpc.router({
  listIndustries: listIndustriesTrpcRoute,
  listObjectTypes: listObjectTypesTrpcRoute,
  listBenchmarks: listBenchmarksTrpcRoute,
  listCatalogFilters: listCatalogFiltersTrpcRoute,
  listSolutions: listSolutionsTrpcRoute,
  getSolution: getSolutionTrpcRoute,
  createProject: createProjectTrpcRoute,
  listProjects: listProjectsTrpcRoute,
  getProject: getProjectTrpcRoute,
  getMatches: getMatchesTrpcRoute,
  calculateEconomics: calculateEconomicsTrpcRoute,
  getCalculation: getCalculationTrpcRoute,
  comparisons: comparisonsTrpcRouter,
  listCaseStudies: listCaseStudiesTrpcRoute,
  createRating: createRatingTrpcRoute,
})

export type TrpcRouter = typeof trpcRouter
