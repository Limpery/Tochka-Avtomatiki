'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: '', label: 'Объект', description: 'Отрасль и параметры' },
  { key: 'solutions', label: 'Подбор', description: 'Подходящие решения' },
  { key: 'compare', label: 'Сравнение', description: 'Таблица характеристик' },
  { key: 'economics', label: 'Экономика', description: 'ROI и окупаемость' },
]

// Навигация по 4 шагам сценария внутри проекта. Текущий шаг определяется по URL.
export function ProjectStepper({ projectId }: { projectId: number }) {
  const pathname = usePathname()
  const base = `/projects/${projectId}`
  const currentIndex = STEPS.findIndex((s) => (s.key ? pathname.startsWith(`${base}/${s.key}`) : pathname === base))

  return (
    <ol className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4">
      {STEPS.map((step, index) => {
        const href = step.key ? `${base}/${step.key}` : base
        const isActive = index === currentIndex
        const isDone = index < currentIndex
        return (
          <li key={step.key}>
            <Link
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent',
                isActive && 'border-primary bg-primary/5',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  isDone && 'border-emerald-500 bg-emerald-500 text-white',
                )}
              >
                {isDone ? <Check className="size-4" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{step.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{step.description}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
