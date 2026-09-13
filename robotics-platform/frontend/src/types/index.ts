// Типы ответов backend API. Prisma Decimal сериализуется в строку, поэтому денежные поля — string.
export type DecimalString = string

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export interface User {
  id: number
  email: string
  name: string | null
  company: string | null
  role: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Industry {
  id: number
  name: string
  slug: string
  description: string | null
  iconUrl: string | null
  _count?: { objectTypes: number }
}

export interface ObjectType {
  id: number
  industryId: number
  name: string
  slug: string
  description: string | null
  industry?: Pick<Industry, 'id' | 'name' | 'slug'>
  _count?: { benchmarkObjects: number }
}

export interface SolutionCategory {
  id: number
  name: string
  slug: string
  description: string | null
  _count?: { robotSolutions: number }
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Vendor {
  id: number
  name: string
  website: string | null
  country: string | null
  description: string | null
  logoUrl: string | null
  _count?: { robotSolutions: number }
}

export interface SolutionSpec {
  id: number
  solutionId: number
  specName: string
  specValue: string
  specUnit: string | null
  sortOrder: number
}

export interface SolutionApplicability {
  industryId: number
  objectTypeId: number | null
  suitabilityScore: DecimalString
  industry?: Pick<Industry, 'id' | 'name' | 'slug'>
  objectType?: Pick<ObjectType, 'id' | 'name' | 'slug'> | null
}

export interface CaseStudy {
  id: number
  solutionId: number
  companyName: string | null
  title: string
  description: string | null
  results: Record<string, unknown> | null
  publishedAt: string | null
  industry?: { id: number; name: string } | null
  objectType?: { id: number; name: string } | null
}

export interface Solution {
  id: number
  vendorId: number
  categoryId: number | null
  name: string
  slug: string
  description: string | null
  priceMin: DecimalString | null
  priceMax: DecimalString | null
  currency: string
  pricingModel: string | null
  imageUrl: string | null
  documentationUrl: string | null
  vendor: Pick<Vendor, 'id' | 'name' | 'country'> & { logoUrl?: string | null }
  category: SolutionCategory | null
  tags: Tag[]
  applicability?: SolutionApplicability[]
  avgRating?: number | null
  ratingsCount?: number
  _count?: { caseStudies: number; specs: number }
}

export interface SolutionDetail extends Solution {
  specs: SolutionSpec[]
  caseStudies: CaseStudy[]
}

export interface BenchmarkObject {
  id: number
  objectTypeId: number
  name: string
  description: string | null
  data: Record<string, unknown>
  objectType?: Pick<ObjectType, 'id' | 'name' | 'slug'>
}

export interface ProjectProcess {
  id: number
  projectId: number
  processName: string
  currentCost: DecimalString | null
  currentHours: DecimalString | null
  employeeCount: number | null
  frequency: string | null
  description: string | null
  sortOrder: number
}

export interface Project {
  id: number
  userId: number
  objectTypeId: number
  name: string
  description: string | null
  useBenchmark: boolean
  benchmarkObjectId: number | null
  areaSqm: DecimalString | null
  employeeCount: number | null
  shiftCount: number | null
  operatingHours: DecimalString | null
  monthlyFund: DecimalString | null
  createdAt: string
  updatedAt: string
  objectType: ObjectType & { industry: Pick<Industry, 'id' | 'name' | 'slug'> }
  benchmark?: Pick<BenchmarkObject, 'id' | 'name' | 'description' | 'data'> | null
  processes?: ProjectProcess[]
  _count?: { processes?: number; matches: number; comparisons: number; calculations?: number }
}

export interface ProjectMatch {
  id: number
  projectId: number
  solutionId: number
  matchScore: DecimalString
  estimatedCost: DecimalString | null
  estimatedSavings: DecimalString
  roiMonths: DecimalString
  notes: string | null
  solution: Solution
}

export interface ComparisonItem {
  id: number
  comparisonId: number
  solutionId: number
  position: number
  solution: Solution & { specs: SolutionSpec[] }
}

export interface ComparisonSummary {
  id: number
  userId: number
  projectId: number | null
  name: string | null
  createdAt: string
  project: { id: number; name: string } | null
  items: Array<{ id: number; solution: { id: number; name: string } }>
}

export interface Comparison extends Omit<ComparisonSummary, 'items'> {
  items: ComparisonItem[]
}

export interface EconomicCalculation {
  id: number
  projectId: number
  solutionId: number
  initialInvestment: DecimalString | null
  annualMaintenance: DecimalString | null
  annualEnergyCost: DecimalString | null
  annualSavings: DecimalString
  paybackMonths: DecimalString
  roi3yr: DecimalString
  roi5yr: DecimalString
  npv: DecimalString
  irr: DecimalString
  assumptions: { stub?: boolean; note?: string } | null
  createdAt: string
  isStub?: boolean
  solution: Pick<Solution, 'id' | 'name' | 'slug' | 'priceMin' | 'priceMax' | 'currency'> & {
    vendor: { id: number; name: string }
    category: { id: number; name: string } | null
  }
}

// Входные данные форм (совпадают с Zod-схемами backend)
export interface CreateProjectInput {
  name: string
  description?: string
  objectTypeId: number
  useBenchmark?: boolean
  benchmarkObjectId?: number | null
  areaSqm?: number | null
  employeeCount?: number | null
  shiftCount?: number | null
  operatingHours?: number | null
  monthlyFund?: number | null
}

export type UpdateProjectInput = Partial<CreateProjectInput>

export interface CreateProcessInput {
  processName: string
  description?: string
  currentCost?: number | null
  currentHours?: number | null
  employeeCount?: number | null
  frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly' | null
}

export interface SolutionFilters {
  industryId?: number
  objectTypeId?: number
  categoryId?: number
  vendorId?: number
  tagIds?: number[]
  search?: string
}
