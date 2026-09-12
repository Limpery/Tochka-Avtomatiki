import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import cn from 'classnames'
import { trpc } from '../../lib/trpc'
import { getSimulationRoute, getSolutionRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Field } from '../../components/Field'
import css from './index.module.scss'

interface CalcResult {
  initialInvestment: number
  annualOpex: number
  annualSavings: number
  monthlySavings: number
  paybackMonths: number
  roi3yr: number
  roi5yr: number
  npv: number
}

const formatRub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`

// Почему CSS, а не библиотека графиков: полоса окупаемости и шкала ROI
// рисуются div'ами без новых зависимостей и работают при любом масштабе.
const PaybackBar = ({ paybackMonths }: { paybackMonths: number }) => {
  // Почему шкала 60 мес: типовой горизонт для складской роботизации, дольше — всё равно «5+ лет».
  const pct = Math.min(100, Math.max(0, (paybackMonths / 60) * 100))
  const tone = paybackMonths <= 0 ? 'empty' : paybackMonths <= 24 ? 'good' : paybackMonths <= 36 ? 'mid' : 'bad'
  return (
    <div className={css.barBlock}>
      <div className={css.barLabel}>
        Окупаемость: {(paybackMonths / 12).toFixed(1)} г ({paybackMonths.toFixed(1)} мес)
      </div>
      <div className={css.barTrack}>
        <div className={cn(css.barFill, css[tone])} style={{ width: `${pct}%` }} />
      </div>
      <div className={css.barScale}>
        <span>0</span>
        <span>2г</span>
        <span>3г</span>
        <span>5+ лет</span>
      </div>
    </div>
  )
}

const RoiScale = ({ roi3yr }: { roi3yr: number }) => {
  // Почему центр на нуле: отрицательный ROI уходит влево красным, положительный — вправо зелёным.
  const pct = Math.min(100, Math.abs(roi3yr) / 200) * 100
  return (
    <div className={css.barBlock}>
      <div className={css.barLabel}>ROI 3 года: {roi3yr.toFixed(1)}%</div>
      <div className={css.barTrackCenter}>
        <div className={css.barHalf}>
          {roi3yr < 0 && <div className={cn(css.barFill, css.bad)} style={{ width: `${pct}%` }} />}
        </div>
        <div className={css.barHalf}>
          {roi3yr >= 0 && <div className={cn(css.barFill, css.good)} style={{ width: `${pct}%` }} />}
        </div>
      </div>
    </div>
  )
}

const KpiGrid = ({ result }: { result: CalcResult }) => {
  const items = [
    { label: 'CAPEX', value: formatRub(result.initialInvestment) },
    { label: 'OPEX/год', value: formatRub(result.annualOpex) },
    { label: 'Экономия/год', value: formatRub(result.annualSavings) },
    { label: 'Экономия/мес', value: formatRub(result.monthlySavings) },
    { label: 'ROI 5 лет', value: `${result.roi5yr.toFixed(1)}%` },
    { label: 'NPV (3г)', value: formatRub(result.npv) },
  ]
  return (
    <div className={css.kpiGrid}>
      {items.map((k) => (
        <div key={k.label} className={css.kpi}>
          <div className={css.kpiLabel}>{k.label}</div>
          <div className={css.kpiValue}>{k.value}</div>
        </div>
      ))}
    </div>
  )
}

const CalcSummary = ({
  result,
  projectId,
  solutionId,
}: {
  result: CalcResult
  projectId: number
  solutionId: number
}) => (
  <Card>
    <h3 className={css.sectionTitle}>Результат расчёта</h3>
    <KpiGrid result={result} />
    <div className={css.charts}>
      <PaybackBar paybackMonths={result.paybackMonths} />
      <RoiScale roi3yr={result.roi3yr} />
    </div>
    <div className={css.actions}>
      <Link className={css.link} to={getSimulationRoute(projectId, solutionId)}>
        → Шаг 4. Визуализация работы роботов
      </Link>
    </div>
  </Card>
)

const Calculator = ({
  projectId,
  activeId,
  onDone,
}: {
  projectId: number
  activeId: number | null
  onDone: (r: CalcResult) => void
}) => {
  const [quantity, setQuantity] = useState('2')
  const calc = trpc.calculateEconomics.useMutation()

  const run = () => {
    if (!activeId) {
      return
    }
    void calc.mutateAsync({ projectId, solutionId: activeId, quantity: Number(quantity) || 1 }).then((r) => {
      onDone(r)
    })
  }

  return (
    <Card className={css.calcCard}>
      <h3 className={css.sectionTitle}>Расчёт экономики</h3>
      <div className={css.calcRow}>
        <Field label="Количество роботов">
          <input
            value={quantity}
            inputMode="numeric"
            onChange={(e) => {
              setQuantity(e.target.value)
            }}
          />
        </Field>
        <Button loading={calc.isPending} disabled={!activeId} onClick={run}>
          Рассчитать
        </Button>
      </div>
      {!activeId && <div className={css.hint}>Выберите решение из подборки ниже</div>}
    </Card>
  )
}

interface MatchItem {
  solutionId: number
  solutionName: string
  solutionSlug: string
  vendorName: string
  matchScore: number
  priceMin: number | null
}

const MatchesList = ({
  projectId,
  matches,
  activeId,
  onSelect,
}: {
  projectId: number
  matches: MatchItem[]
  activeId: number | null
  onSelect: (id: number) => void
}) => (
  <section>
    <h3 className={css.sectionTitle}>Подобранные решения</h3>
    <div className={css.matches}>
      {matches.map((m) => {
        const active = activeId === m.solutionId
        return (
          <button
            key={m.solutionId}
            type="button"
            className={cn(css.matchCard, { [css.matchActive]: active })}
            onClick={() => {
              onSelect(m.solutionId)
            }}
          >
            <span className={css.matchName}>
              <Link
                className={css.link}
                to={getSolutionRoute(m.solutionSlug, projectId)}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {m.solutionName}
              </Link>
            </span>
            <span className={css.matchMeta}>
              {m.vendorName} · {m.priceMin?.toLocaleString('ru-RU') ?? '—'} ₽
            </span>
            <Badge tone={m.matchScore >= 80 ? 'success' : m.matchScore >= 60 ? 'warning' : undefined}>
              совпадение {m.matchScore}%
            </Badge>
          </button>
        )
      })}
    </div>
  </section>
)

interface SavedCalc {
  id: number
  solutionId: number
  initialInvestment: number | null
  paybackMonths: number
  roi3yr: number
  solution: { name: string }
}

const SavedCalculations = ({ projectId, items }: { projectId: number; items: SavedCalc[] }) => {
  if (items.length === 0) {
    return null
  }
  return (
    <section>
      <h3 className={css.sectionTitle}>Сохранённые расчёты</h3>
      <Card className={css.tableCard}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>Решение</th>
              <th>CAPEX</th>
              <th>Окупаемость</th>
              <th>ROI 3г</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.solution.name}</td>
                <td>{c.initialInvestment?.toLocaleString('ru-RU')} ₽</td>
                <td>{(c.paybackMonths / 12).toFixed(1)} г</td>
                <td>{c.roi3yr}%</td>
                <td>
                  <Link className={css.link} to={getSimulationRoute(projectId, c.solutionId)}>
                    визуализация →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  )
}

interface ProjectInfo {
  industryName: string
  objectTypeName: string
  areaSqm: number | null
  employeeCount: number | null
  monthlyFund: number | null
  processes: Array<{ id: number; processName: string; currentCost: number | null }>
}

const ProjectSummary = ({ info }: { info: ProjectInfo }) => (
  <Card>
    <div className={css.badges}>
      <Badge tone="info">{info.industryName}</Badge>
      <Badge tone="accent">{info.objectTypeName}</Badge>
      {info.areaSqm !== null && <Badge>Площадь: {info.areaSqm} м²</Badge>}
      {info.employeeCount !== null && <Badge>Сотрудников: {info.employeeCount}</Badge>}
      {info.monthlyFund !== null && <Badge>ФОТ: {info.monthlyFund.toLocaleString('ru-RU')} ₽/мес</Badge>}
    </div>
    <h3 className={css.sectionTitle}>Процессы</h3>
    <ul className={css.processes}>
      {info.processes.map((proc) => (
        <li key={proc.id} className={css.process}>
          <span>{proc.processName}</span>
          <b>{proc.currentCost?.toLocaleString('ru-RU') ?? '—'} ₽/мес</b>
        </li>
      ))}
    </ul>
  </Card>
)

const ResultSection = ({ projectId, activeId }: { projectId: number; activeId: number | null }) => {
  const [result, setResult] = useState<CalcResult | null>(null)
  return (
    <div className={css.resultSection}>
      <Calculator
        projectId={projectId}
        activeId={activeId}
        onDone={(r) => {
          setResult(r)
        }}
      />
      {result && activeId && <CalcSummary result={result} projectId={projectId} solutionId={activeId} />}
    </div>
  )
}

const ProjectBody = ({ projectId }: { projectId: number }) => {
  const [solutionId, setSolutionId] = useState<number | null>(null)

  const project = trpc.getProject.useQuery({ id: projectId }, { enabled: projectId > 0 })
  const matches = trpc.getMatches.useQuery({ projectId }, { enabled: projectId > 0 })

  if (project.isLoading || !project.data) {
    return <div className={css.hint}>{project.isLoading ? 'Загрузка…' : 'Проект не найден'}</div>
  }
  const p = project.data
  const activeId = solutionId ?? matches.data?.at(0)?.solutionId ?? null

  return (
    <div className={css.body}>
      <ProjectSummary
        info={{
          industryName: p.objectType.industry.name,
          objectTypeName: p.objectType.name,
          areaSqm: p.areaSqm,
          employeeCount: p.employeeCount,
          monthlyFund: p.monthlyFund,
          processes: p.processes,
        }}
      />
      <MatchesList
        projectId={projectId}
        matches={matches.data ?? []}
        activeId={activeId}
        onSelect={(id) => {
          setSolutionId(id)
        }}
      />
      <ResultSection projectId={projectId} activeId={activeId} />
      <SavedCalculations projectId={projectId} items={p.calculations} />
    </div>
  )
}

export const ProjectPage = () => {
  const { id } = useParams()
  return (
    <Segment
      title="Шаг 3. Экономика проекта"
      description="Выберите решение из подборки, укажите количество роботов и рассчитайте окупаемость."
    >
      <ProjectBody projectId={Number(id)} />
    </Segment>
  )
}
