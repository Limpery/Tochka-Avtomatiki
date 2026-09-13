'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, GitCompare, Plus, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectStepper } from '@/components/projects/project-stepper'
import { ComparisonTable } from '@/components/comparisons/comparison-table'
import {
  useAddComparisonItem,
  useComparison,
  useComparisons,
  useDeleteComparison,
  useRemoveComparisonItem,
} from '@/hooks/use-comparisons'
import { useMatches } from '@/hooks/use-projects'
import { getApiErrorMessage } from '@/lib/api'
import { formatDate } from '@/lib/utils'

// Шаг 3 сценария: табличное сравнение выбранных решений.
function CompareContent() {
  const params = useParams<{ id: string }>()
  const projectId = Number(params.id)
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromUrl = Number(searchParams.get('comparisonId'))

  const comparisons = useComparisons(projectId)
  const [comparisonId, setComparisonId] = useState<number | null>(fromUrl > 0 ? fromUrl : null)

  // Если в URL ничего нет — открываем последнее сравнение проекта.
  useEffect(() => {
    if (comparisonId === null && comparisons.data && comparisons.data.length > 0) {
      setComparisonId(comparisons.data[0].id)
    }
  }, [comparisonId, comparisons.data])

  const comparison = useComparison(comparisonId)
  const matches = useMatches(projectId)
  const removeItem = useRemoveComparisonItem(comparisonId ?? 0)
  const addItem = useAddComparisonItem(comparisonId ?? 0)
  const deleteComparison = useDeleteComparison()

  const inComparison = new Set(comparison.data?.items.map((i) => i.solutionId) ?? [])
  const addable = (matches.data ?? []).filter((m) => !inComparison.has(m.solutionId))

  return (
    <div>
      <PageHeader
        title="Сравнение решений"
        description="Шаг 3 из 4 — характеристики выбранных решений в одной таблице"
        actions={
          <Link href={`/projects/${projectId}/solutions`} className={buttonVariants({ variant: 'outline' })}>
            <Plus />
            Новое сравнение
          </Link>
        }
      />

      <ProjectStepper projectId={projectId} />

      {comparisons.isLoading && <Skeleton className="h-64" />}

      {comparisons.data && comparisons.data.length === 0 && (
        <EmptyState
          icon={<GitCompare />}
          title="Сравнений пока нет"
          description="Вернитесь на шаг подбора, отметьте два и более решения и нажмите «Сравнить»."
          action={
            <Link href={`/projects/${projectId}/solutions`} className={buttonVariants()}>
              К подбору решений
            </Link>
          }
        />
      )}

      {comparisons.data && comparisons.data.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:max-w-md">
              <Select value={comparisonId ?? ''} onChange={(e) => setComparisonId(Number(e.target.value))}>
                {comparisons.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ?? `Сравнение #${c.id}`} · {c.items.length} реш. · {formatDate(c.createdAt)}
                  </option>
                ))}
              </Select>
            </div>
            {comparisonId && (
              <Button
                variant="ghost"
                className="text-destructive"
                loading={deleteComparison.isPending}
                onClick={() => {
                  if (window.confirm('Удалить это сравнение?')) {
                    deleteComparison.mutate(comparisonId, { onSuccess: () => setComparisonId(null) })
                  }
                }}
              >
                <Trash2 />
                Удалить
              </Button>
            )}
          </div>

          {comparison.isLoading && <Skeleton className="h-64" />}
          {comparison.isError && (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(comparison.error)}</AlertDescription>
            </Alert>
          )}
          {(removeItem.isError || addItem.isError) && (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(removeItem.error ?? addItem.error)}</AlertDescription>
            </Alert>
          )}

          {comparison.data && (
            <Card>
              <CardContent className="p-0">
                {comparison.data.items.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground">В этом сравнении нет решений.</p>
                ) : (
                  <ComparisonTable
                    items={comparison.data.items}
                    onRemove={(itemId) => removeItem.mutate(itemId)}
                    removing={removeItem.isPending}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {comparison.data && addable.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-muted-foreground">Добавить из подобранных:</span>
              <div className="flex flex-wrap gap-2">
                {addable.map((m) => (
                  <Button
                    key={m.id}
                    variant="outline"
                    size="sm"
                    disabled={addItem.isPending}
                    onClick={() => addItem.mutate(m.solutionId)}
                  >
                    <Plus />
                    {m.solution.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {comparison.data && comparison.data.items.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => router.push(`/projects/${projectId}/economics`)}>
                К расчёту экономики
                <ArrowRight />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  // Почему Suspense: useSearchParams в клиентском компоненте требует границу при статической сборке.
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <CompareContent />
    </Suspense>
  )
}
