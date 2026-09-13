'use client'

import { Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useSolutionCategories, useTags, useVendors } from '@/hooks/use-catalog'
import { cn } from '@/lib/utils'
import type { SolutionFilters } from '@/types'

interface SolutionFiltersBarProps {
  value: SolutionFilters
  onChange: (next: SolutionFilters) => void
  showVendor?: boolean
}

// Фильтры каталога: категория, вендор, теги, поиск. Отрасль/объект приходят снаружи (из проекта).
export function SolutionFiltersBar({ value, onChange, showVendor = true }: SolutionFiltersBarProps) {
  const categories = useSolutionCategories()
  const vendors = useVendors()
  const tags = useTags()
  const selectedTags = value.tagIds ?? []
  const hasFilters = Boolean(value.categoryId || value.vendorId || selectedTags.length > 0 || value.search)

  const toggleTag = (tagId: number) => {
    const next = selectedTags.includes(tagId) ? selectedTags.filter((id) => id !== tagId) : [...selectedTags, tagId]
    onChange({ ...value, tagIds: next })
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск по названию или описанию"
            value={value.search ?? ''}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>
        <Select
          value={value.categoryId ?? ''}
          onChange={(e) => onChange({ ...value, categoryId: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Все категории</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {showVendor && (
          <Select
            value={value.vendorId ?? ''}
            onChange={(e) => onChange({ ...value, vendorId: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">Все вендоры</option>
            {vendors.data?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tags.data?.map((tag) => {
          const active = selectedTags.includes(tag.id)
          return (
            <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}>
              <Badge
                variant={active ? 'default' : 'outline'}
                className={cn('cursor-pointer font-normal', !active && 'hover:bg-accent')}
              >
                {tag.name}
              </Badge>
            </button>
          )
        })}
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => onChange({ industryId: value.industryId, objectTypeId: value.objectTypeId })}
          >
            <X />
            Сбросить
          </Button>
        )}
      </div>
    </div>
  )
}
