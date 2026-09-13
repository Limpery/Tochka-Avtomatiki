'use client'

import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatNumber } from '@/lib/utils'
import type { Project } from '@/types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1 text-base">{project.name}</CardTitle>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <CardDescription className="flex items-center gap-1.5">
            <Building2 className="size-3.5" />
            {project.objectType.industry.name} · {project.objectType.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {project.areaSqm && <Badge variant="secondary">{formatNumber(project.areaSqm)} м²</Badge>}
            {project.employeeCount !== null && <Badge variant="secondary">{project.employeeCount} чел.</Badge>}
            {project._count && project._count.matches > 0 && (
              <Badge variant="success">{project._count.matches} решений</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Обновлён {formatDate(project.updatedAt)}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
