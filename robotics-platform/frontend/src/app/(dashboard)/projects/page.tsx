'use client'

import Link from 'next/link'
import { FolderKanban, Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProjectCard } from '@/components/projects/project-card'
import { useProjects } from '@/hooks/use-projects'
import { getApiErrorMessage } from '@/lib/api'

export default function ProjectsPage() {
  const projects = useProjects()

  return (
    <div>
      <PageHeader
        title="Проекты"
        description="Каждый проект — это ваш объект с подобранными решениями, сравнениями и расчётами"
        actions={
          <Link href="/projects/new" className={buttonVariants()}>
            <Plus className="size-4" />
            Новый проект
          </Link>
        }
      />

      {projects.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      )}

      {projects.isError && (
        <Alert variant="destructive">
          <AlertDescription>{getApiErrorMessage(projects.error)}</AlertDescription>
        </Alert>
      )}

      {projects.data && projects.data.length === 0 && (
        <EmptyState
          icon={<FolderKanban />}
          title="Проектов пока нет"
          description="Создайте проект: выберите отрасль и тип объекта, укажите параметры — и платформа подберёт решения."
          action={
            <Link href="/projects/new" className={buttonVariants()}>
              Создать проект
            </Link>
          }
        />
      )}

      {projects.data && projects.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
