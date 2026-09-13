'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Pencil, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ProjectStepper } from '@/components/projects/project-stepper'
import { ProjectForm } from '@/components/projects/project-form'
import { ProcessList } from '@/components/projects/process-list'
import { useDeleteProject, useProject, useUpdateProject } from '@/hooks/use-projects'
import { getApiErrorMessage } from '@/lib/api'
import { formatMoney, formatNumber } from '@/lib/utils'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>()
  const projectId = Number(params.id)
  const router = useRouter()
  const project = useProject(projectId)
  const updateProject = useUpdateProject(projectId)
  const deleteProject = useDeleteProject()
  const [editing, setEditing] = useState(false)

  if (project.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-20" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (project.isError || !project.data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getApiErrorMessage(project.error, 'Проект не найден')}</AlertDescription>
      </Alert>
    )
  }

  const p = project.data

  return (
    <div>
      <PageHeader
        title={p.name}
        description={`${p.objectType.industry.name} · ${p.objectType.name}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing((v) => !v)}>
              <Pencil />
              {editing ? 'Отмена' : 'Изменить'}
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              loading={deleteProject.isPending}
              onClick={() => {
                if (window.confirm('Удалить проект вместе с подборами и сравнениями?')) {
                  deleteProject.mutate(projectId, { onSuccess: () => router.push('/projects') })
                }
              }}
            >
              <Trash2 />
              Удалить
            </Button>
          </>
        }
      />

      <ProjectStepper projectId={projectId} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {editing ? (
            <Card>
              <CardHeader>
                <CardTitle>Параметры объекта</CardTitle>
              </CardHeader>
              <CardContent>
                {updateProject.isError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{getApiErrorMessage(updateProject.error)}</AlertDescription>
                  </Alert>
                )}
                <ProjectForm
                  objectTypeId={p.objectTypeId}
                  initial={p}
                  submitLabel="Сохранить"
                  loading={updateProject.isPending}
                  onSubmit={(input) => updateProject.mutate(input, { onSuccess: () => setEditing(false) })}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Параметры объекта</CardTitle>
                {p.description && <CardDescription>{p.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Stat label="Площадь" value={p.areaSqm ? `${formatNumber(p.areaSqm)} м²` : '—'} />
                  <Stat label="Персонал" value={p.employeeCount !== null ? `${p.employeeCount} чел.` : '—'} />
                  <Stat label="Смены" value={p.shiftCount !== null ? String(p.shiftCount) : '—'} />
                  <Stat label="Часов в сутки" value={p.operatingHours ? formatNumber(p.operatingHours, 1) : '—'} />
                  <Stat label="ФОТ в месяц" value={formatMoney(p.monthlyFund)} />
                  <Stat label="Эталон" value={p.benchmark?.name ?? 'Не используется'} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Бизнес-процессы</CardTitle>
              <CardDescription>Что планируется роботизировать и сколько это стоит сейчас</CardDescription>
            </CardHeader>
            <CardContent>
              <ProcessList projectId={projectId} processes={p.processes ?? []} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Прогресс</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Подобрано решений</span>
                <Badge variant={p._count?.matches ? 'success' : 'secondary'}>{p._count?.matches ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Сравнений</span>
                <Badge variant="secondary">{p._count?.comparisons ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Расчётов экономики</span>
                <Badge variant="secondary">{p._count?.calculations ?? 0}</Badge>
              </div>
              <Link href={`/projects/${projectId}/solutions`} className={buttonVariants({ className: 'mt-2 w-full' })}>
                Перейти к подбору
                <ArrowRight />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
