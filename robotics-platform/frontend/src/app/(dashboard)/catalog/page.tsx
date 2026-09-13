'use client'

import { useState } from 'react'
import { PackageSearch } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Select } from '@/components/ui/select'
import { SolutionCard } from '@/components/solutions/solution-card'
import { SolutionFiltersBar } from '@/components/solutions/solution-filters'
import { useIndustries, useObjectTypes, useSolutions } from '@/hooks/use-catalog'
import { getApiErrorMessage } from '@/lib/api'
import type { SolutionFilters } from '@/types'

// Полный каталог решений с серверной фильтрацией (industryId, objectTypeId, categoryId, tagIds, search).
export default function CatalogPage() {
  const [filters, setFilters] = useState<SolutionFilters>({})
  const industries = useIndustries()
  const objectTypes = useObjectTypes(filters.industryId)
  const solutions = useSolutions(filters)

  return (
    <div>
      <PageHeader
        title="Каталог решений"
        description="Все роботизированные решения на платформе. Фильтруйте по отрасли, объекту, категории и тегам."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Select
          value={filters.industryId ?? ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              industryId: e.target.value ? Number(e.target.value) : undefined,
              objectTypeId: undefined,
            })
          }
        >
          <option value="">Все отрасли</option>
          {industries.data?.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </Select>
        <Select
          value={filters.objectTypeId ?? ''}
          disabled={!filters.industryId}
          onChange={(e) => setFilters({ ...filters, objectTypeId: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Все типы объектов</option>
          {objectTypes.data?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-6">
        <SolutionFiltersBar value={filters} onChange={setFilters} />
      </div>

      {solutions.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      )}

      {solutions.isError && (
        <Alert variant="destructive">
          <AlertDescription>{getApiErrorMessage(solutions.error)}</AlertDescription>
        </Alert>
      )}

      {solutions.data && solutions.data.length === 0 && (
        <EmptyState
          icon={<PackageSearch />}
          title="Решений не найдено"
          description="Попробуйте изменить или сбросить фильтры."
        />
      )}

      {solutions.data && solutions.data.length > 0 && (
        <>
          <p className="mb-3 text-sm text-muted-foreground">Найдено решений: {solutions.data.length}</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {solutions.data.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
