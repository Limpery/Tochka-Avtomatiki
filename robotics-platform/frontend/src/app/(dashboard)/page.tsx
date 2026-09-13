'use client'

import Link from 'next/link'
import { ArrowRight, Building2, Calculator, GitCompare, Plus, Search } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { ProjectCard } from '@/components/projects/project-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjects } from '@/hooks/use-projects'
import { useAuthStore } from '@/stores/auth-store'

const STEPS = [
  { icon: Building2, title: '1. Объект', text: 'Выберите отрасль, тип объекта и укажите параметры: площадь, персонал, смены.' },
  { icon: Search, title: '2. Подбор', text: 'Платформа отберёт решения из каталога, применимые к вашему объекту.' },
  { icon: GitCompare, title: '3. Сравнение', text: 'Сравните характеристики выбранных роботов в одной таблице.' },
  { icon: Calculator, title: '4. Экономика', text: 'Оцените CAPEX, OPEX, ROI и срок окупаемости (пока заглушка).' },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const projects = useProjects()
  const recent = projects.data?.slice(0, 3) ?? []

  return (
    <div>
      <PageHeader
        title={`Здравствуйте${user?.name ? `, ${user.name}` : ''}!`}
        description="Подберите роботизированное решение для вашего объекта за 4 шага"
        actions={
          <Link href="/projects/new" className={buttonVariants()}>
            <Plus className="size-4" />
            Новый проект
          </Link>
        }
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <Icon className="mb-2 size-6 text-primary" />
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{text}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Последние проекты</h2>
        <Link href="/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
          Все проекты <ArrowRight className="size-4" />
        </Link>
      </div>

      {projects.isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Проектов пока нет.{' '}
            <Link href="/projects/new" className="text-primary hover:underline">
              Создайте первый
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {recent.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
