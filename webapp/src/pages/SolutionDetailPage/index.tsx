import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { getCatalogRoute, getProjectRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'

const RatingForm = ({ solutionId, onRated }: { solutionId: number; onRated: () => void }) => {
  const [rating, setRating] = useState('5')
  const rate = trpc.createRating.useMutation()
  return (
    <div>
      <h3>Оценить</h3>
      <select
        value={rating}
        onChange={(e) => {
          setRating(e.target.value)
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={String(n)}>
            {n}
          </option>
        ))}
      </select>{' '}
      <Button
        loading={rate.isPending}
        onClick={() => {
          void rate.mutateAsync({ solutionId, rating: Number(rating) }).then(() => {
            onRated()
          })
        }}
      >
        Поставить оценку
      </Button>
    </div>
  )
}

const CasesList = ({ solutionId }: { solutionId: number }) => {
  const cases = trpc.listCaseStudies.useQuery({ solutionId }, { enabled: solutionId > 0 })
  if (!cases.data || cases.data.length === 0) {
    return null
  }
  return (
    <div>
      <h3>Кейсы</h3>
      {cases.data.map((c) => (
        <div key={c.id}>
          <b>{c.title}</b> — {c.companyName}: {c.description} <code>{JSON.stringify(c.results)}</code>
        </div>
      ))}
    </div>
  )
}

interface HeaderInfo {
  vendorName: string
  vendorCountry: string | null
  categoryName: string | null
  priceMin: number | null
  priceMax: number | null
  avgRating: number | null
  ratingsCount: number
}

const SolutionHeader = ({ info }: { info: HeaderInfo }) => {
  const price = info.priceMin
    ? `${info.priceMin.toLocaleString('ru-RU')}–${info.priceMax?.toLocaleString('ru-RU')} ₽`
    : 'по запросу'
  const rating = info.avgRating === null ? 'без оценок' : `★${info.avgRating.toFixed(1)} (${info.ratingsCount})`
  return (
    <div>
      Вендор: {info.vendorName} ({info.vendorCountry}) · Категория: {info.categoryName} · Цена: {price} · {rating}
    </div>
  )
}

export const SolutionDetailPage = () => {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const projectId = params.get('projectId') ? Number(params.get('projectId')) : undefined
  const solution = trpc.getSolution.useQuery({ slug })

  if (solution.isLoading) {
    return <div>Загрузка...</div>
  }
  if (!solution.data) {
    return <div>Решение не найдено</div>
  }
  const s = solution.data

  return (
    <Segment title={s.name} description={s.description ?? ''}>
      <SolutionHeader
        info={{
          vendorName: s.vendor.name,
          vendorCountry: s.vendor.country,
          categoryName: s.category?.name ?? null,
          priceMin: s.priceMin,
          priceMax: s.priceMax,
          avgRating: s.avgRating,
          ratingsCount: s.ratingsCount,
        }}
      />
      <h3>Характеристики</h3>
      <table>
        <tbody>
          {s.specs.map((sp) => (
            <tr key={sp.id}>
              <td>{sp.specName}</td>
              <td>
                {sp.specValue} {sp.specUnit ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Применимость</h3>
      <ul>
        {s.applicability.map((a) => (
          <li key={a.id}>
            {a.industry.name} / {a.objectType?.name ?? 'вся отрасль'} — {(a.suitabilityScore * 100).toFixed(0)}%
          </li>
        ))}
      </ul>
      <CasesList solutionId={s.id} />
      <RatingForm
        solutionId={s.id}
        onRated={() => {
          void solution.refetch()
        }}
      />
      <div style={{ marginTop: 12 }}>
        {projectId ? (
          <Link to={getProjectRoute(projectId)}>→ К экономике проекта</Link>
        ) : (
          <Link to={getCatalogRoute()}>← Назад в каталог</Link>
        )}
      </div>
    </Segment>
  )
}
