'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Calculator, Construction } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectStepper } from '@/components/projects/project-stepper'
import { useEconomics, useMatches, useProject } from '@/hooks/use-projects'
import { getApiErrorMessage } from '@/lib/api'
import { formatMoney, formatNumber } from '@/lib/utils'
import type { EconomicCalculation } from '@/types'

interface MetricProps {
  label: string
  value: string
  hint?: string
}

function Metric({ label, value, hint }: MetricProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>}
    </Card>
  )
}

function percent(value: string): string {
  return `${formatNumber(value, 2)} %`
}

function metrics(calc: EconomicCalculation): MetricProps[] {
  return [
    { label: 'CAPEX — первоначальные инвестиции', value: formatMoney(calc.initialInvestment) },
    { label: 'OPEX — обслуживание в год', value: formatMoney(calc.annualMaintenance) },
    { label: 'Энергозатраты в год', value: formatMoney(calc.annualEnergyCost) },
    { label: 'Экономия в год', value: formatMoney(calc.annualSavings) },
    { label: 'Срок окупаемости', value: `${formatNumber(calc.paybackMonths, 1)} мес.` },
    { label: 'ROI за 3 года', value: percent(calc.roi3yr) },
    { label: 'ROI за 5 лет', value: percent(calc.roi5yr) },
    { label: 'NPV', value: formatMoney(calc.npv) },
    { label: 'IRR', value: percent(calc.irr) },
  ]
}

// Шаг 4 сценария: экономический расчёт. Пока ЗАГЛУШКА — backend возвращает нули.
export default function EconomicsPage() {
  const params = useParams<{ id: string }>()
  const projectId = Number(params.id)
  const project = useProject(projectId)
  const matches = useMatches(projectId)
  const [solutionId, setSolutionId] = useState<number | null>(null)

  useEffect(() => {
    if (solutionId === null && matches.data && matches.data.length > 0) {
      setSolutionId(matches.data[0].solutionId)
    }
  }, [solutionId, matches.data])

  const economics = useEconomics(projectId, solutionId)

  return (
    <div>
      <PageHeader
        title="Экономический расчёт"
        description={
          project.data
            ? `Шаг 4 из 4 — оценка эффекта роботизации для «${project.data.name}»`
            : 'Шаг 4 из 4 — оценка эффекта роботизации'
        }
      />

      <ProjectStepper projectId={projectId} />

      <Alert variant="warning" className="mb-6">
        <Construction />
        <AlertTitle>Расчёт экономики — заглушка</AlertTitle>
        <AlertDescription>
          Все показатели равны нулю. Модель расчёта будет подключена после получения данных от вендоров.
          Интерфейс и API готовы — меняется только формула на backend.
        </AlertDescription>
      </Alert>

      {matches.isLoading && <Skeleton className="h-64" />}

      {matches.data && matches.data.length === 0 && (
        <EmptyState
          icon={<Calculator />}
          title="Сначала подберите решения"
          description="Экономика считается для конкретного решения из подбора."
          action={
            <Link href={`/projects/${projectId}/solutions`} className={buttonVariants()}>
              К подбору решений
            </Link>
          }
        />
      )}

      {matches.data && matches.data.length > 0 && (
        <div className="space-y-6">
          <div className="max-w-md">
            <label className="mb-2 block text-sm font-medium" htmlFor="solution">
              Решение
            </label>
            <Select id="solution" value={solutionId ?? ''} onChange={(e) => setSolutionId(Number(e.target.value))}>
              {matches.data.map((m) => (
                <option key={m.id} value={m.solutionId}>
                  {m.solution.name} — {m.solution.vendor.name}
                </option>
              ))}
            </Select>
          </div>

          {economics.isLoading && <Skeleton className="h-64" />}
          {economics.isError && (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(economics.error)}</AlertDescription>
            </Alert>
          )}

          {economics.data && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {metrics(economics.data).map((m) => (
                  <Metric key={m.label} {...m} />
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Допущения расчёта</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {economics.data.assumptions?.note ?? 'Допущения не заданы.'}
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div>
                      <div className="text-xs">Решение</div>
                      <div className="font-medium text-foreground">{economics.data.solution.name}</div>
                    </div>
                    <div>
                      <div className="text-xs">Цена решения (каталог)</div>
                      <div className="font-medium text-foreground">
                        {economics.data.solution.priceMin
                          ? `от ${formatMoney(economics.data.solution.priceMin, economics.data.solution.currency)}`
                          : 'По запросу'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs">ФОТ объекта в месяц</div>
                      <div className="font-medium text-foreground">{formatMoney(project.data?.monthlyFund)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}
