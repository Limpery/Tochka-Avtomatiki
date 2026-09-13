'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ObjectPicker } from '@/components/projects/object-picker'
import { ProjectForm } from '@/components/projects/project-form'
import { useCreateProject } from '@/hooks/use-projects'
import { getApiErrorMessage } from '@/lib/api'

// Шаг 1 сценария: отрасль → тип объекта → параметры объекта.
export default function NewProjectPage() {
  const router = useRouter()
  const [industryId, setIndustryId] = useState<number | null>(null)
  const [objectTypeId, setObjectTypeId] = useState<number | null>(null)
  const createProject = useCreateProject()

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Новый проект"
        description="Шаг 1 из 4 — выберите отрасль и тип объекта, затем опишите параметры"
      />

      <div className="space-y-6">
        <ObjectPicker
          industryId={industryId}
          objectTypeId={objectTypeId}
          onIndustryChange={(id) => {
            setIndustryId(id)
            // Почему сбрасываем: типы объектов принадлежат отрасли, старый выбор невалиден.
            setObjectTypeId(null)
          }}
          onObjectTypeChange={setObjectTypeId}
        />

        {objectTypeId && (
          <Card>
            <CardHeader>
              <CardTitle>Параметры объекта</CardTitle>
              <CardDescription>Эти данные будут использованы для подбора и экономического расчёта</CardDescription>
            </CardHeader>
            <CardContent>
              {createProject.isError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle />
                  <AlertDescription>{getApiErrorMessage(createProject.error)}</AlertDescription>
                </Alert>
              )}
              <ProjectForm
                key={objectTypeId}
                objectTypeId={objectTypeId}
                loading={createProject.isPending}
                onSubmit={(input) =>
                  createProject.mutate(
                    { ...input, objectTypeId },
                    { onSuccess: (project) => router.push(`/projects/${project.id}/solutions`) },
                  )
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
