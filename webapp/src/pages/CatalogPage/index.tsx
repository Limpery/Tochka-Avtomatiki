import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { getCompareRoute, getSolutionRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import css from './index.module.scss'

interface SolutionCardData {
  id: number
  name: string
  slug: string
  description: string | null
  priceMin: number | null
  vendor: { name: string }
  category: { name: string } | null
  avgRating: number | null
  ratingsCount: number
  suitabilityScore: number | null
  tags: Array<{ slug: string; name: string }>
}

const SolutionBadges = ({ solution: s }: { solution: SolutionCardData }) => (
  <div className={css.badges}>
    {s.avgRating !== null && (
      <Badge tone="accent">
        ★ {s.avgRating.toFixed(1)} ({s.ratingsCount})
      </Badge>
    )}
    {s.suitabilityScore !== null && <Badge tone="success">подходит {(s.suitabilityScore * 100).toFixed(0)}%</Badge>}
    {s.tags.map((t) => (
      <Badge key={t.slug}>{t.name}</Badge>
    ))}
  </div>
)

const SolutionCard = ({
  solution: s,
  checked,
  projectId,
  onToggle,
}: {
  solution: SolutionCardData
  checked: boolean
  projectId: number | undefined
  onToggle: (id: number) => void
}) => (
  <article className={css.solutionCard}>
    <label className={css.checkRow}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {
          onToggle(s.id)
        }}
      />
      <Link className={css.name} to={getSolutionRoute(s.slug, projectId)}>
        {s.name}
      </Link>
    </label>
    <div className={css.meta}>
      {s.vendor.name} · {s.category?.name ?? '—'}
    </div>
    <div className={css.price}>{s.priceMin ? `${s.priceMin.toLocaleString('ru-RU')} ₽` : 'цена по запросу'}</div>
    <SolutionBadges solution={s} />
    {s.description && <p className={css.desc}>{s.description}</p>}
  </article>
)

const useCatalogQuery = () => {
  const [params] = useSearchParams()
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const solutions = trpc.listSolutions.useQuery({
    industrySlug: params.get('industry') ?? undefined,
    objectTypeSlug: params.get('objectType') ?? undefined,
    categorySlug: category || undefined,
    search: search || undefined,
  })
  return { solutions, category, setCategory, search, setSearch }
}

const useCompareSelection = () => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number[]>([])
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

  return { selected, toggle, compare, comparing: createComparison.isPending }
}

export const CatalogPage = () => {
  const [params] = useSearchParams()
  const projectId = params.get('projectId') ? Number(params.get('projectId')) : undefined
  const { solutions, category, setCategory, search, setSearch } = useCatalogQuery()
  const { selected, toggle, compare, comparing } = useCompareSelection()
  const filters = trpc.listCatalogFilters.useQuery()

  return (
    <Segment
      title="Шаг 2. Подборка и сравнение решений"
      description="Отметьте два и более решения, чтобы сравнить характеристики side-by-side."
    >
      <Card className={css.filters}>
        <input
          className={css.search}
          placeholder="Поиск по названию…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
        />
        <select
          className={css.select}
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
        </select>
        {selected.length >= 2 && (
          <Button
            loading={comparing}
            onClick={() => {
              void compare()
            }}
          >
            Сравнить выбранные ({selected.length})
          </Button>
        )}
      </Card>
      {solutions.isLoading && <div className={css.hint}>Загружаем решения…</div>}
      <div className={css.grid}>
        {solutions.data?.map((s) => (
          <SolutionCard
            key={s.id}
            solution={s}
            checked={selected.includes(s.id)}
            projectId={projectId}
            onToggle={(id) => {
              toggle(id)
            }}
          />
        ))}
      </div>
      {solutions.data?.length === 0 && <div className={css.hint}>Ничего не найдено — измените фильтры.</div>}
    </Segment>
  )
}
