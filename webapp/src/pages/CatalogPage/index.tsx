import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { getCompareRoute, getSolutionRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'

export const CatalogPage = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const industry = params.get('industry') ?? undefined
  const objectType = params.get('objectType') ?? undefined
  const projectId = params.get('projectId') ? Number(params.get('projectId')) : undefined

  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  const filters = trpc.listCatalogFilters.useQuery()
  const solutions = trpc.listSolutions.useQuery({
    industrySlug: industry,
    objectTypeSlug: objectType,
    categorySlug: category || undefined,
    search: search || undefined,
  })
  const createComparison = trpc.comparisons.create.useMutation()
  const addItem = trpc.comparisons.addItem.useMutation()

  const toggle = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const compare = async () => {
    const { id } = await createComparison.mutateAsync({})
    await Promise.all(selected.map(async (solutionId) => await addItem.mutateAsync({ comparisonId: id, solutionId })))
    void navigate(getCompareRoute(id))
  }

  return (
    <Segment title="Шаг 2. Подборка и сравнение решений">
      <div>
        <input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
        />{' '}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
          }}
        >
          <option value="">Все типы</option>
          {filters.data?.categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>{' '}
        {selected.length >= 2 && (
          <Button
            loading={createComparison.isPending}
            onClick={() => {
              void compare()
            }}
          >
            Сравнить выбранные ({selected.length})
          </Button>
        )}
      </div>
      {solutions.data?.map((s) => (
        <div key={s.id} style={{ border: '1px solid #ccc', margin: '8px 0', padding: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={selected.includes(s.id)}
              onChange={() => {
                toggle(s.id)
              }}
            />{' '}
            <Link to={getSolutionRoute(s.slug, projectId)}>
              <b>{s.name}</b>
            </Link>
          </label>{' '}
          — {s.vendor.name} · {s.category?.name} ·{' '}
          {s.priceMin ? `${s.priceMin.toLocaleString('ru-RU')} ₽` : 'цена по запросу'}
          {s.avgRating !== null && ` · ★${s.avgRating.toFixed(1)} (${s.ratingsCount})`}
          {s.suitabilityScore !== null && ` · подходит ${(s.suitabilityScore * 100).toFixed(0)}%`}
          <div>{s.description}</div>
          <div style={{ color: '#555' }}>{s.tags.map((t) => t.name).join(' · ')}</div>
        </div>
      ))}
    </Segment>
  )
}
