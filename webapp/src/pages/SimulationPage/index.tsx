import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import css from './index.module.scss'

interface Bot {
  x: number
  y: number
  dx: number
  speed: number
}

const makeBots = (): Bot[] =>
  Array.from({ length: 8 }, (_, i) => ({
    x: 40 + ((i * 90) % 560),
    y: 60 + ((i * 70) % 220),
    dx: i % 2 === 0 ? 1 : -1,
    speed: 1 + (i % 3) * 0.5,
  }))

const RobotCanvas = ({ running, onSecond }: { running: boolean; onSecond: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onSecondRef = useRef(onSecond)

  useEffect(() => {
    onSecondRef.current = onSecond
  }, [onSecond])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    const bots = makeBots()
    let raf = 0
    let frames = 0
    const frame = () => {
      ctx.clearRect(0, 0, 640, 320)
      // Почему цвета из темы захардкожены: canvas рисуется пикселями, SCSS-переменные туда не пробросить.
      ctx.strokeStyle = '#c9d1de'
      for (let r = 0; r < 4; r += 1) {
        ctx.strokeRect(20, 30 + r * 70, 600, 50)
      }
      ctx.fillStyle = '#4f46e5'
      for (const b of bots) {
        b.x += b.dx * b.speed
        if (b.x > 600) {
          b.dx = -1
        }
        if (b.x < 30) {
          b.dx = 1
        }
        ctx.beginPath()
        ctx.arc(b.x, b.y, 10, 0, Math.PI * 2)
        ctx.fill()
      }
      frames += 1
      if (frames % 30 === 0) {
        onSecondRef.current()
      }
      raf = requestAnimationFrame(frame)
    }
    if (running) {
      raf = requestAnimationFrame(frame)
    }
    return () => {
      cancelAnimationFrame(raf)
    }
  }, [running])

  return <canvas ref={canvasRef} width={640} height={320} className={css.canvas} />
}

interface KpiInfo {
  ticks: number
  monthlySavings: number
  paybackMonths: number | null
  roi3yr: number | string
  roi5yr: number | string
}

const KpiBlock = ({ info }: { info: KpiInfo }) => {
  const opsDone = info.ticks * 12
  const savedSoFar = (info.monthlySavings / (30 * 24 * 60)) * info.ticks
  const payback = info.paybackMonths === null ? '—' : `${(info.paybackMonths / 12).toFixed(1)} г`
  const items = [
    { label: 'Операций (сим.)', value: String(opsDone) },
    { label: 'Накоплено (сим.)', value: `${savedSoFar.toFixed(2)} ₽` },
    { label: 'Экономия/мес', value: `${info.monthlySavings.toLocaleString('ru-RU')} ₽` },
    { label: 'Окупаемость', value: payback },
    { label: 'ROI 3г / 5л', value: `${info.roi3yr}% / ${info.roi5yr}%` },
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

const StatusLine = ({ projectName, calcName }: { projectName: string | undefined; calcName: string | undefined }) => (
  <div className={css.badges}>
    <Badge tone="info">{projectName ?? 'Проект'}</Badge>
    {calcName ? <Badge tone="success">{calcName}</Badge> : <Badge>нет расчёта — вернитесь на шаг 3</Badge>}
  </div>
)

const ControlsBlock = ({
  running,
  onTick,
  onToggle,
}: {
  running: boolean
  onTick: () => void
  onToggle: () => void
}) => (
  <Card>
    <RobotCanvas running={running} onSecond={onTick} />
    <div className={css.controls}>
      <Button
        variant="ghost"
        onClick={() => {
          onToggle()
        }}
      >
        {running ? 'Пауза' : 'Старт'}
      </Button>
    </div>
  </Card>
)

const useCalcSelection = (projectId: number, solutionId: number | undefined) => {
  const project = trpc.getProject.useQuery({ id: projectId }, { enabled: projectId > 0 })
  return {
    projectName: project.data?.name,
    calcSolutionId: solutionId ?? project.data?.calculations.at(0)?.solutionId,
  }
}

const useSimulationData = (projectId: number, calcSolutionId: number | undefined) => {
  const calculation = trpc.getCalculation.useQuery(
    { projectId, solutionId: calcSolutionId ?? 0 },
    { enabled: !!calcSolutionId },
  )
  const monthly = calculation.data ? calculation.data.annualSavings / 12 : 0
  return {
    monthlySavings: monthly,
    calcName: calculation.data?.solution.name,
    paybackMonths: calculation.data?.paybackMonths ?? null,
    roi3yr: calculation.data?.roi3yr ?? '—',
    roi5yr: calculation.data?.roi5yr ?? '—',
  }
}

const SimulationBody = ({ projectId, solutionId }: { projectId: number; solutionId: number | undefined }) => {
  const [ticks, setTicks] = useState(0)
  const [running, setRunning] = useState(true)
  const selection = useCalcSelection(projectId, solutionId)
  const data = useSimulationData(projectId, selection.calcSolutionId)

  return (
    <div className={css.body}>
      <StatusLine projectName={selection.projectName} calcName={data.calcName} />
      <ControlsBlock
        running={running}
        onTick={() => {
          setTicks((t) => t + 1)
        }}
        onToggle={() => {
          setRunning((r) => !r)
        }}
      />
      <KpiBlock
        info={{
          ticks,
          monthlySavings: data.monthlySavings,
          paybackMonths: data.paybackMonths,
          roi3yr: data.roi3yr,
          roi5yr: data.roi5yr,
        }}
      />
    </div>
  )
}

export const SimulationPage = () => {
  const { id } = useParams()
  const [params] = useSearchParams()
  const projectId = Number(id)
  const solutionId = params.get('solutionId') ? Number(params.get('solutionId')) : undefined
  return (
    <Segment
      title="Шаг 4. Визуализация работы роботов"
      description="Симуляция показывает работу роботов на объекте и накопление экономии в реальном времени."
    >
      <SimulationBody projectId={projectId} solutionId={solutionId} />
    </Segment>
  )
}
