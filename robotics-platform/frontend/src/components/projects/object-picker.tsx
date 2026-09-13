'use client'

import { Building2, HeartPulse, HelpCircle, Plane, ShoppingCart, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useIndustries, useObjectTypes } from '@/hooks/use-catalog'
import { cn } from '@/lib/utils'

// Иконки по slug отрасли: iconUrl из БД пока не отдаётся статикой.
const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  trade: ShoppingCart,
  logistics: Plane,
  social: HeartPulse,
  other: HelpCircle,
}

interface ObjectPickerProps {
  industryId: number | null
  objectTypeId: number | null
  onIndustryChange: (id: number) => void
  onObjectTypeChange: (id: number) => void
}

export function ObjectPicker({ industryId, objectTypeId, onIndustryChange, onObjectTypeChange }: ObjectPickerProps) {
  const industries = useIndustries()
  const objectTypes = useObjectTypes(industryId ?? undefined)

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Отрасль</h2>
        {industries.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {industries.data?.map((industry) => {
              const Icon = INDUSTRY_ICONS[industry.slug] ?? Building2
              const active = industry.id === industryId
              return (
                <button
                  type="button"
                  key={industry.id}
                  onClick={() => onIndustryChange(industry.id)}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      'h-full p-4 transition-colors hover:bg-accent',
                      active && 'border-primary bg-primary/5 ring-1 ring-primary',
                    )}
                  >
                    <Icon className={cn('mb-2 size-6', active ? 'text-primary' : 'text-muted-foreground')} />
                    <div className="font-medium">{industry.name}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{industry.description}</div>
                  </Card>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {industryId && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Тип объекта</h2>
          {objectTypes.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {objectTypes.data?.map((objectType) => {
                const active = objectType.id === objectTypeId
                return (
                  <button
                    type="button"
                    key={objectType.id}
                    onClick={() => onObjectTypeChange(objectType.id)}
                    className="text-left"
                  >
                    <Card
                      className={cn(
                        'h-full p-4 transition-colors hover:bg-accent',
                        active && 'border-primary bg-primary/5 ring-1 ring-primary',
                      )}
                    >
                      <div className="font-medium">{objectType.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{objectType.description}</div>
                    </Card>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
