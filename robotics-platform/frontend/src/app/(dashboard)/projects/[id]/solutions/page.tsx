'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { GitCompare, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { ProjectStepper } from '@/components/projects/project-stepper'
import { SolutionCard } from '@/components/solutions/solution-card'
import { SolutionFiltersBar } from '@/components/solutions/solution-filters'
import { useGenerateMatches, useMatches, useProject } from '@/hooks/use-projects'
import { useCreateComparison } from '@/hooks/use-comparisons'
import { useSelectionStore } from '@/stores/selection-store'
import { getApiErrorMessage } from '@/lib/api'
import type { ProjectMatch, SolutionFilters } from '@/types'

// Почему фильтруем на клиенте: подбор уже сузил выборку до применимых решений, их немного.
function applyFilters(matches: ProjectMatch[], filters: SolutionFilters): ProjectMatch[] {
  const search = filters.search?.trim().toLowerCase()
  return matches.filter(({ solution }) => {
    if (filters.categoryId && solution.categoryId !== filters.categoryId) return false
    if (filters.vendorId && solution.vendorId !== filters.vendorId) return false
    if (filters.tagIds && filters.tagIds.length > 0) {
      const tagIds = new Set(solution.tags.map((t) => t.id))
      if (!filters.tagIds.every((id) => tagIds.has(id))) return false
    }
    if (search) {
      const haystack = `${solution.name} ${solution.description ?? ''}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}

// Шаг 2 сценария: подбор решений по применимости к объекту проекта.
export default function ProjectSolutionsPage() {
  const params = useParams<{ id: string }>()
  const projectId = Number(params.id)
  const router = useRouter()
  const project = useProject(projectId)
  const matches = useMatches(projectId)
  const generate = useGenerateMatches(projectId)
  const createComparison = useCreateComparison()
  const [filters, setFilters] = useState<SolutionFilters>({})

  const selected = useSelectionStore((s) => s.selectedByProject[projectId] ?? [])
  const toggle = useSelectionStore((s) => s.toggle)
  const clear = useSelectionStore((s) => s.clear)

  const visible = useMemo(() => applyFilters(matches.data ?? [], filters), [matches.data, filters])

  const startComparison = () => {
    createComparison.mutate(
      { projectId, solutionIds: selected, name: `Сравнение: ${project.data?.name ?? 'проект'}` },
      {
        onSuccess: (comparison) => {
          clear(projectId)
          router.push(`/projects/${projectId}/compare?comparisonId=${comparison.id}`)
        },
      },
    )
  }

  if (project.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getApiErrorMessage(project.error, 'Проект не найден')}</AlertDescription>
      </Alert>
    )
  }

  const hasMatches = (matches.data?.length ?? 0) > 0

  return (
    <div className="pb-24">
      <PageHeader
        title="Подбор решений"
        description={
          project.data
            ? `Шаг 2 из 4 — решения, применимые к объекту «${project.data.objectType.name}» (${project.data.objectType.industry.name})`
            : 'Шаг 2 из 4'
        }
        actions={
          hasMatches ? (
            <Button variant="outline" loading={generate.isPending} onClick={() => generate.mutate()}>
              <RefreshCw />
              Подобрать заново
            </Button>
          ) : undefined
        }
      />

      <ProjectStepper projectId={projectId} />

      {generate.isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{getApiErrorMessage(generate.error)}</AlertDescription>
        </Alert>
      )}

      {(matches.isLoading || project.isLoading) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      )}

      {matches.data && !hasMatches && (
        <EmptyState
          icon={<Sparkles />}
          title="Решения ещё не подобраны"
          description="Платформа отберёт из каталога роботов, применимых к вашей отрасли и типу объекта, и оценит степень соответствия."
          action={
            <Button size="lg" loading={generate.isPending} onClick={() => generate.mutate()}>
              <Sparkles />
              Подобрать решения
            </Button>
          }
        />
      )}

      {hasMatches && (
        <div className="space-y-4">
          <Alert variant="info">
            <Sparkles />
            <AlertTitle>Как считается соответствие</AlertTitle>
            <AlertDescription>
              Пока это оценка применимости решения к типу объекта из каталога. Экономические показатели
              (экономия, окупаемость) — заглушка и равны нулю.
            </AlertDescription>
          </Alert>

          <SolutionFiltersBar value={filters} onChange={setFilters} />

          {visible.length === 0 ? (
            <EmptyState title="Ничего не найдено" description="Попробуйте изменить или сбросить фильтры." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((match) => (
                <SolutionCard
                  key={match.id}
                  solution={match.solution}
                  matchScore={match.matchScore}
                  selectable
                  selected={selected.includes(match.solutionId)}
                  onToggle={() => toggle(projectId, match.solutionId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur">
          <div className="container flex items-center justify-between gap-4 py-3">
            <div className="text-sm">
              Выбрано решений: <span className="font-semibold">{selected.length}</span>
              {selected.length < 2 && <span className="text-muted-foreground"> — выберите минимум два</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => clear(projectId)}>
                Сбросить
              </Button>
              <Button disabled={selected.length < 2} loading={createComparison.isPending} onClick={startComparison}>
                <GitCompare />
                Сравнить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
