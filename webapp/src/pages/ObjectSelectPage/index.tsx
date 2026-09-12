import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import cn from 'classnames'
import { trpc } from '../../lib/trpc'
import { getCatalogRoute, getProjectRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Field } from '../../components/Field'
import css from './index.module.scss'

const IndustryPicker = ({ selected, onSelect }: { selected: string; onSelect: (slug: string) => void }) => {
  const industries = trpc.listIndustries.useQuery()
  return (
    <section>
      <h3 className={css.sectionTitle}>Отрасль</h3>
      <div className={css.pills}>
        {industries.data?.map((i) => (
          <button
            key={i.slug}
            type="button"
            className={cn(css.pill, { [css.pillActive]: selected === i.slug })}
            onClick={() => {
              onSelect(i.slug)
            }}
            title={i.description ?? undefined}
          >
            {i.name}
          </button>
        ))}
      </div>
    </section>
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
    <section>
      <h3 className={css.sectionTitle}>Тип объекта</h3>
      <div className={css.cards}>
        {objectTypes.data?.map((o) => (
          <button
            key={o.id}
            type="button"
            className={cn(css.pickCard, { [css.pickCardActive]: selectedId === o.id })}
            onClick={() => {
              onSelect(o.id)
            }}
          >
            <span className={css.pickCardName}>{o.name}</span>
            {o.description && <span className={css.pickCardDesc}>{o.description}</span>}
          </button>
        ))}
      </div>
    </section>
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
    <section>
      <h3 className={css.sectionTitle}>Эталонный объект (пример данных)</h3>
      <div className={css.pills}>
        {benchmarks.data?.map((b: { id: number; name: string }) => (
          <button
            key={b.id}
            type="button"
            className={cn(css.pill, { [css.pillActive]: selectedId === b.id })}
            onClick={() => {
              onSelect(b.id)
            }}
          >
            {b.name}
          </button>
        ))}
      </div>
    </section>
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
    <Segment
      title="Шаг 1. Выбор отрасли и объекта"
      description="Выберите отрасль и тип объекта, укажите параметры — платформа создаст проект и подберёт решения."
    >
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
      <Card>
        <h3 className={css.sectionTitle}>Параметры моего объекта</h3>
        <div className={css.formGrid}>
          <Field label="Название">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
            />
          </Field>
          <Field label="Площадь, м²">
            <input
              value={areaSqm}
              inputMode="numeric"
              onChange={(e) => {
                setAreaSqm(e.target.value)
              }}
            />
          </Field>
          <Field label="Сотрудников">
            <input
              value={employeeCount}
              inputMode="numeric"
              onChange={(e) => {
                setEmployeeCount(e.target.value)
              }}
            />
          </Field>
          <Field label="ФОТ/мес, ₽">
            <input
              value={monthlyFund}
              inputMode="numeric"
              onChange={(e) => {
                setMonthlyFund(e.target.value)
              }}
            />
          </Field>
        </div>
        {error && <div className={css.error}>{error}</div>}
        <div className={css.actions}>
          <Button
            loading={createProject.isPending}
            onClick={() => {
              void submit()
            }}
          >
            Создать проект и перейти к экономике
          </Button>
          <a className={css.link} href={getCatalogRoute(selectedType ? { objectType: selectedType.slug } : undefined)}>
            Сначала посмотреть решения →
          </a>
        </div>
      </Card>
    </Segment>
  )
}
