'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMoney, PRICING_MODEL_LABELS } from '@/lib/utils'
import type { ComparisonItem } from '@/types'

interface ComparisonTableProps {
  items: ComparisonItem[]
  onRemove?: (itemId: number) => void
  removing?: boolean
}

// Таблица «характеристика × решение». Строки — объединение всех spec_name (EAV),
// порядок — по первому появлению с учётом sortOrder.
export function ComparisonTable({ items, onRemove, removing }: ComparisonTableProps) {
  const specNames: string[] = []
  const seen = new Set<string>()
  for (const item of items) {
    for (const spec of [...item.solution.specs].sort((a, b) => a.sortOrder - b.sortOrder)) {
      if (!seen.has(spec.specName)) {
        seen.add(spec.specName)
        specNames.push(spec.specName)
      }
    }
  }

  const specValue = (item: ComparisonItem, name: string): string => {
    const spec = item.solution.specs.find((s) => s.specName === name)
    if (!spec) return '—'
    return spec.specUnit ? `${spec.specValue} ${spec.specUnit}` : spec.specValue
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-48 min-w-40">Характеристика</TableHead>
          {items.map((item) => (
            <TableHead key={item.id} className="min-w-48 align-top">
              <div className="flex items-start justify-between gap-2 py-2">
                <div>
                  <Link href={`/catalog/${item.solutionId}`} className="font-semibold text-foreground hover:underline">
                    {item.solution.name}
                  </Link>
                  <div className="text-xs font-normal">{item.solution.vendor.name}</div>
                </div>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Убрать из сравнения"
                    disabled={removing}
                    onClick={() => onRemove(item.id)}
                  >
                    <X />
                  </Button>
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium text-muted-foreground">Категория</TableCell>
          {items.map((item) => (
            <TableCell key={item.id}>
              {item.solution.category ? <Badge variant="secondary">{item.solution.category.name}</Badge> : '—'}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="font-medium text-muted-foreground">Цена</TableCell>
          {items.map((item) => (
            <TableCell key={item.id} className="font-semibold">
              {item.solution.priceMin
                ? `${formatMoney(item.solution.priceMin, item.solution.currency)} – ${formatMoney(item.solution.priceMax, item.solution.currency)}`
                : 'По запросу'}
            </TableCell>
          ))}
        </TableRow>
        <TableRow>
          <TableCell className="font-medium text-muted-foreground">Модель оплаты</TableCell>
          {items.map((item) => (
            <TableCell key={item.id}>
              {item.solution.pricingModel
                ? (PRICING_MODEL_LABELS[item.solution.pricingModel] ?? item.solution.pricingModel)
                : '—'}
            </TableCell>
          ))}
        </TableRow>
        {specNames.map((name) => (
          <TableRow key={name}>
            <TableCell className="font-medium text-muted-foreground">{name}</TableCell>
            {items.map((item) => (
              <TableCell key={item.id}>{specValue(item, name)}</TableCell>
            ))}
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="font-medium text-muted-foreground">Теги</TableCell>
          {items.map((item) => (
            <TableCell key={item.id}>
              <div className="flex flex-wrap gap-1">
                {item.solution.tags.length > 0
                  ? item.solution.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="font-normal">
                        {tag.name}
                      </Badge>
                    ))
                  : '—'}
              </div>
            </TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  )
}
