'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Bot, ExternalLink, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { useSolution } from '@/hooks/use-catalog'
import { getApiErrorMessage } from '@/lib/api'
import { formatDate, formatMoney, formatNumber, PRICING_MODEL_LABELS } from '@/lib/utils'

export default function SolutionDetailPage() {
  const params = useParams<{ id: string }>()
  const solution = useSolution(Number(params.id))

  if (solution.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (solution.isError || !solution.data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{getApiErrorMessage(solution.error, 'Решение не найдено')}</AlertDescription>
      </Alert>
    )
  }

  const s = solution.data

  return (
    <div>
      <Link href="/catalog" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Каталог
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Bot className="size-10 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{s.name}</h1>
          <p className="text-sm text-muted-foreground">
            {s.vendor.name}
            {s.vendor.country ? ` · ${s.vendor.country}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {s.category && <Badge>{s.category.name}</Badge>}
            {s.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="font-normal">
                {tag.name}
              </Badge>
            ))}
            {s.avgRating != null && (
              <span className="ml-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {s.avgRating.toFixed(1)} ({s.ratingsCount})
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {s.pricingModel ? (PRICING_MODEL_LABELS[s.pricingModel] ?? s.pricingModel) : 'Цена'}
          </div>
          <div className="text-xl font-semibold">
            {s.priceMin ? `${formatMoney(s.priceMin, s.currency)} – ${formatMoney(s.priceMax, s.currency)}` : 'По запросу'}
          </div>
          {s.documentationUrl && (
            <a
              href={s.documentationUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'outline', size: 'sm', className: 'mt-2' })}
            >
              Документация
              <ExternalLink />
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">{s.description ?? 'Описание отсутствует.'}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Характеристики</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {s.specs.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">Характеристики не заполнены.</p>
              ) : (
                <Table>
                  <TableBody>
                    {s.specs.map((spec) => (
                      <TableRow key={spec.id}>
                        <TableCell className="w-1/2 text-muted-foreground">{spec.specName}</TableCell>
                        <TableCell className="font-medium">
                          {spec.specValue}
                          {spec.specUnit ? ` ${spec.specUnit}` : ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {s.caseStudies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Кейсы внедрения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {s.caseStudies.map((cs) => (
                  <div key={cs.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold">{cs.title}</h3>
                      <span className="text-xs text-muted-foreground">{formatDate(cs.publishedAt)}</span>
                    </div>
                    {cs.companyName && <p className="text-sm text-muted-foreground">{cs.companyName}</p>}
                    {cs.description && <p className="mt-2 text-sm">{cs.description}</p>}
                    {cs.results && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(cs.results).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="font-normal">
                            {key}: {typeof value === 'number' ? formatNumber(value) : String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Применимость</CardTitle>
              <CardDescription>Для каких отраслей и объектов подходит</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(s.applicability ?? []).map((a, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span>
                    {a.industry?.name}
                    {a.objectType ? ` · ${a.objectType.name}` : ' · вся отрасль'}
                  </span>
                  <Badge variant="success">{Math.round(Number(a.suitabilityScore) * 100)}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
