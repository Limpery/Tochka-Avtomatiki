import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { getSimulationRoute, getSolutionRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'

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

interface MatchItem {
  solutionId: number
  solutionName: string
  solutionSlug: string
  vendorName: string
  matchScore: number
  priceMin: number | null
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
  <div style={{ marginTop: 12 }}>
    <div>CAPEX: {result.initialInvestment.toLocaleString('ru-RU')} ₽</div>
    <div>OPEX/год: {result.annualOpex.toLocaleString('ru-RU')} ₽</div>
    <div>Экономия/год: {result.annualSavings.toLocaleString('ru-RU')} ₽</div>
    <div>
      Окупаемость: {(result.paybackMonths / 12).toFixed(1)} г ({result.paybackMonths.toFixed(1)} мес)
    </div>
    <div>
      ROI 3 года: {result.roi3yr.toFixed(1)}% · ROI 5 лет: {result.roi5yr.toFixed(1)}%
    </div>
    <div>NPV (3г): {result.npv.toLocaleString('ru-RU')} ₽</div>
    <div style={{ marginTop: 8 }}>
      <Link to={getSimulationRoute(projectId, solutionId)}>→ Шаг 4. Визуализация работы роботов</Link>
    </div>
  </div>
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
    <div>
      <h3>Расчет</h3>
      <label>
        Количество{' '}
        <input
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value)
          }}
          style={{ width: 60 }}
        />
      </label>{' '}
      <Button loading={calc.isPending} disabled={!activeId} onClick={run}>
        Рассчитать
      </Button>
    </div>
  )
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
  <div>
    <h3>Подобранные решения</h3>
    {matches.map((m) => (
      <div key={m.solutionId} style={{ margin: '4px 0' }}>
        <input
          type="radio"
          name="solution"
          checked={activeId === m.solutionId}
          onChange={() => {
            onSelect(m.solutionId)
          }}
        />{' '}
        <Link to={getSolutionRoute(m.solutionSlug, projectId)}>{m.solutionName}</Link> — {m.vendorName}, совпадение{' '}
        {m.matchScore}%, цена {m.priceMin?.toLocaleString('ru-RU') ?? '—'} ₽
      </div>
    ))}
  </div>
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
    <div>
      <h3>Сохраненные расчеты</h3>
      <ul>
        {items.map((c) => (
          <li key={c.id}>
            {c.solution.name}: CAPEX {c.initialInvestment?.toLocaleString('ru-RU')} ₽, окупаемость{' '}
            {(c.paybackMonths / 12).toFixed(1)} г, ROI3 {c.roi3yr}%{' '}
            <Link to={getSimulationRoute(projectId, c.solutionId)}>визуализация →</Link>
          </li>
        ))}
      </ul>
    </div>
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
  <div>
    <div>
      {info.industryName} / {info.objectTypeName} · Площадь: {info.areaSqm ?? '—'} м² · Сотрудников:{' '}
      {info.employeeCount ?? '—'} · ФОТ: {info.monthlyFund?.toLocaleString('ru-RU') ?? '—'} ₽/мес
    </div>
    <h3>Процессы</h3>
    <ul>
      {info.processes.map((proc) => (
        <li key={proc.id}>
          {proc.processName}: {proc.currentCost?.toLocaleString('ru-RU') ?? '—'} ₽/мес
        </li>
      ))}
    </ul>
  </div>
)

const ResultSection = ({ projectId, activeId }: { projectId: number; activeId: number | null }) => {
  const [result, setResult] = useState<CalcResult | null>(null)
  return (
    <div>
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
    return <div>{project.isLoading ? 'Загрузка...' : 'Проект не найден'}</div>
  }
  const p = project.data
  const activeId = solutionId ?? matches.data?.at(0)?.solutionId ?? null

  return (
    <div>
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
    <Segment title="Шаг 3. Экономика проекта">
      <ProjectBody projectId={Number(id)} />
    </Segment>
  )
}
