import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { Segment } from '../../components/Segment'

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
      ctx.strokeStyle = '#999'
      for (let r = 0; r < 4; r += 1) {
        ctx.strokeRect(20, 30 + r * 70, 600, 50)
      }
      ctx.fillStyle = '#1a73e8'
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

  return <canvas ref={canvasRef} width={640} height={320} style={{ border: '1px solid #333', marginTop: 8 }} />
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
  return (
    <div style={{ marginTop: 8 }}>
      <div>Операций выполнено (симуляция): {opsDone}</div>
      <div>Накопленная экономия (симуляция): {savedSoFar.toFixed(2)} ₽</div>
      <div>Экономия/мес (расчет): {info.monthlySavings.toLocaleString('ru-RU')} ₽</div>
      <div>Окупаемость: {payback}</div>
      <div>
        ROI 3г: {info.roi3yr}% · ROI 5л: {info.roi5yr}%
      </div>
    </div>
  )
}

const StatusLine = ({ projectName, calcName }: { projectName: string | undefined; calcName: string | undefined }) => (
  <div>
    Проект: {projectName} · Расчет: {calcName ?? 'нет расчета — вернитесь на шаг 3'}
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
  <div>
    <RobotCanvas running={running} onSecond={onTick} />
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        onClick={() => {
          onToggle()
        }}
      >
        {running ? 'Пауза' : 'Старт'}
      </button>
    </div>
  </div>
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
    <div>
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
    <Segment title="Шаг 4. Визуализация работы роботов">
      <SimulationBody projectId={projectId} solutionId={solutionId} />
    </Segment>
  )
}
