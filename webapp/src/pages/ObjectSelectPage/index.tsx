import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { getCatalogRoute, getProjectRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'

const IndustryPicker = ({ selected, onSelect }: { selected: string; onSelect: (slug: string) => void }) => {
  const industries = trpc.listIndustries.useQuery()
  return (
    <div>
      <h3>Отрасль</h3>
      {industries.data?.map((i) => (
        <button
          key={i.slug}
          type="button"
          onClick={() => {
            onSelect(i.slug)
          }}
          style={{ fontWeight: selected === i.slug ? 'bold' : 'normal', marginRight: 8 }}
        >
          {i.name}
        </button>
      ))}
    </div>
  )
}

const ObjectTypePicker = ({
  industrySlug,
  selectedId,
  onSelect,
}: {
  industrySlug: string
  selectedId: number | null
  onSelect: (id: number) => void
}) => {
  const objectTypes = trpc.listObjectTypes.useQuery({ industrySlug: industrySlug || undefined })
  if (!industrySlug) {
    return null
  }
  return (
    <div>
      <h3>Тип объекта</h3>
      {objectTypes.data?.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => {
            onSelect(o.id)
          }}
          style={{ fontWeight: selectedId === o.id ? 'bold' : 'normal', marginRight: 8 }}
        >
          {o.name}
        </button>
      ))}
    </div>
  )
}

const BenchmarkPicker = ({
  objectTypeSlug,
  selectedId,
  onSelect,
}: {
  objectTypeSlug: string | undefined
  selectedId: number | null
  onSelect: (id: number) => void
}) => {
  const benchmarks = trpc.listBenchmarks.useQuery(
    { objectTypeSlug: objectTypeSlug ?? '' },
    { enabled: !!objectTypeSlug },
  )
  if (!objectTypeSlug) {
    return null
  }
  return (
    <div>
      <h3>Эталонный объект (пример данных)</h3>
      {benchmarks.data?.map((b: { id: number; name: string }) => (
        <button
          key={b.id}
          type="button"
          onClick={() => {
            onSelect(b.id)
          }}
          style={{ fontWeight: selectedId === b.id ? 'bold' : 'normal', marginRight: 8 }}
        >
          {b.name}
        </button>
      ))}
    </div>
  )
}

export const ObjectSelectPage = () => {
  const navigate = useNavigate()
  const [industrySlug, setIndustrySlug] = useState<string>('')
  const [objectTypeId, setObjectTypeId] = useState<number | null>(null)
  const [benchmarkId, setBenchmarkId] = useState<number | null>(null)
  const [name, setName] = useState('Мой объект')
  const [areaSqm, setAreaSqm] = useState('3000')
  const [employeeCount, setEmployeeCount] = useState('25')
  const [monthlyFund, setMonthlyFund] = useState('1200000')
  const [error, setError] = useState<string | null>(null)

  const objectTypes = trpc.listObjectTypes.useQuery({ industrySlug: industrySlug || undefined })
  const selectedType = objectTypes.data?.find((o) => o.id === objectTypeId)
  const createProject = trpc.createProject.useMutation()

  const submit = async () => {
    if (!objectTypeId) {
      setError('Выберите тип объекта')
      return
    }
    try {
      const fund = Number(monthlyFund) || 0
      const res = await createProject.mutateAsync({
        objectTypeId,
        name,
        benchmarkObjectId: benchmarkId ?? undefined,
        areaSqm: Number(areaSqm) || undefined,
        employeeCount: Number(employeeCount) || undefined,
        shiftCount: 2,
        monthlyFund: fund || undefined,
        processes: [
          { processName: 'Комплектация заказов', currentCost: Math.round(fund * 0.5) },
          { processName: 'Транспортировка грузов', currentCost: Math.round(fund * 0.25) },
        ],
      })
      void navigate(getProjectRoute(res.id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка создания проекта')
    }
  }

  return (
    <Segment title="Шаг 1. Выбор отрасли и объекта">
      <IndustryPicker
        selected={industrySlug}
        onSelect={(slug) => {
          setIndustrySlug(slug)
          setObjectTypeId(null)
        }}
      />
      <ObjectTypePicker
        industrySlug={industrySlug}
        selectedId={objectTypeId}
        onSelect={(id) => {
          setObjectTypeId(id)
        }}
      />
      <BenchmarkPicker
        objectTypeSlug={selectedType?.slug}
        selectedId={benchmarkId}
        onSelect={(id) => {
          setBenchmarkId(id)
        }}
      />
      <h3>Параметры моего объекта</h3>
      <div>
        <label>
          Название{' '}
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
          />
        </label>{' '}
        <label>
          Площадь, м²{' '}
          <input
            value={areaSqm}
            onChange={(e) => {
              setAreaSqm(e.target.value)
            }}
          />
        </label>{' '}
        <label>
          Сотрудников{' '}
          <input
            value={employeeCount}
            onChange={(e) => {
              setEmployeeCount(e.target.value)
            }}
          />
        </label>{' '}
        <label>
          ФОТ/мес, ₽{' '}
          <input
            value={monthlyFund}
            onChange={(e) => {
              setMonthlyFund(e.target.value)
            }}
          />
        </label>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginTop: 12 }}>
        <Button
          loading={createProject.isPending}
          onClick={() => {
            void submit()
          }}
        >
          Создать проект и перейти к экономике
        </Button>{' '}
        <a href={getCatalogRoute(selectedType ? { objectType: selectedType.slug } : undefined)}>
          Сначала посмотреть решения →
        </a>
      </div>
    </Segment>
  )
}
