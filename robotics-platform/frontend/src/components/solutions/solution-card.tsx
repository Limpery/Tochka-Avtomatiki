'use client'

import Link from 'next/link'
import { Bot, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn, formatMoney, PRICING_MODEL_LABELS } from '@/lib/utils'
import type { Solution } from '@/types'

interface SolutionCardProps {
  solution: Solution
  matchScore?: string | number | null
  selectable?: boolean
  selected?: boolean
  onToggle?: () => void
}

export function SolutionCard({ solution, matchScore, selectable, selected, onToggle }: SolutionCardProps) {
  const score = matchScore !== undefined && matchScore !== null ? Math.round(Number(matchScore)) : null

  return (
    <Card className={cn('flex h-full flex-col transition-shadow hover:shadow-md', selected && 'border-primary ring-1 ring-primary')}>
      <CardHeader className="flex-row items-start gap-3 space-y-0 pb-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted">
          <Bot className="size-6 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/catalog/${solution.id}`} className="line-clamp-1 font-semibold hover:underline">
            {solution.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {solution.vendor.name}
            {solution.vendor.country ? ` · ${solution.vendor.country}` : ''}
          </p>
        </div>
        {selectable && (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Checkbox checked={Boolean(selected)} onChange={onToggle} aria-label="Выбрать для сравнения" />
          </label>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {solution.category && <Badge>{solution.category.name}</Badge>}
          {score !== null && (
            <Badge variant={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'secondary'}>
              Соответствие {score}%
            </Badge>
          )}
          {solution.avgRating != null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {solution.avgRating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">{solution.description}</p>
        <div className="flex flex-wrap gap-1">
          {solution.tags.slice(0, 4).map((tag) => (
            <Badge key={tag.id} variant="outline" className="font-normal">
              {tag.name}
            </Badge>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="text-xs text-muted-foreground">
              {solution.pricingModel ? (PRICING_MODEL_LABELS[solution.pricingModel] ?? solution.pricingModel) : 'Цена'}
            </div>
            <div className="text-sm font-semibold">
              {solution.priceMin ? `от ${formatMoney(solution.priceMin, solution.currency)}` : 'По запросу'}
            </div>
          </div>
          {selectable && (
            <button
              type="button"
              onClick={onToggle}
              className="text-xs font-medium text-primary hover:underline"
            >
              {selected ? 'Убрать' : 'К сравнению'}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
