import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { getCatalogRoute, getProjectRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import css from './index.module.scss'

const RatingForm = ({ solutionId, onRated }: { solutionId: number; onRated: () => void }) => {
  const [rating, setRating] = useState('5')
  const rate = trpc.createRating.useMutation()
  return (
    <Card className={css.rateCard}>
      <h3 className={css.sectionTitle}>Оценить решение</h3>
      <div className={css.rateRow}>
        <select
          className={css.select}
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
        </select>
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
    </Card>
  )
}

const CasesList = ({ solutionId }: { solutionId: number }) => {
  const cases = trpc.listCaseStudies.useQuery({ solutionId }, { enabled: solutionId > 0 })
  if (!cases.data || cases.data.length === 0) {
    return null
  }
  return (
    <section>
      <h3 className={css.sectionTitle}>Кейсы внедрений</h3>
      <div className={css.cases}>
        {cases.data.map((c) => (
          <Card key={c.id}>
            <div className={css.caseTitle}>{c.title}</div>
            <div className={css.caseMeta}>
              {c.companyName && <Badge tone="info">{c.companyName}</Badge>}
              {c.industry && <Badge>{c.industry.name}</Badge>}
              {c.objectType && <Badge>{c.objectType.name}</Badge>}
            </div>
            {c.description && <p className={css.caseDesc}>{c.description}</p>}
          </Card>
        ))}
      </div>
    </section>
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

const SolutionHeader = ({ info }: { info: HeaderInfo }) => (
  <Card className={css.hero}>
    <div className={css.heroPrice}>
      {info.priceMin
        ? `${info.priceMin.toLocaleString('ru-RU')}–${info.priceMax?.toLocaleString('ru-RU')} ₽`
        : 'цена по запросу'}
    </div>
    <div className={css.badges}>
      <Badge tone="info">{info.vendorName}</Badge>
      {info.vendorCountry && <Badge>{info.vendorCountry}</Badge>}
      {info.categoryName && <Badge tone="accent">{info.categoryName}</Badge>}
      {info.avgRating === null ? (
        <Badge>без оценок</Badge>
      ) : (
        <Badge tone="accent">
          ★ {info.avgRating.toFixed(1)} ({info.ratingsCount})
        </Badge>
      )}
    </div>
  </Card>
)

export const SolutionDetailPage = () => {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const projectId = params.get('projectId') ? Number(params.get('projectId')) : undefined
  const solution = trpc.getSolution.useQuery({ slug })

  if (solution.isLoading) {
    return <div className={css.hint}>Загрузка…</div>
  }
  if (!solution.data) {
    return <div className={css.hint}>Решение не найдено</div>
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
      <section>
        <h3 className={css.sectionTitle}>Характеристики</h3>
        <Card className={css.tableCard}>
          <table className={css.table}>
            <tbody>
              {s.specs.map((sp) => (
                <tr key={sp.id}>
                  <td className={css.specName}>{sp.specName}</td>
                  <td>
                    {sp.specValue} {sp.specUnit ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
      <section>
        <h3 className={css.sectionTitle}>Применимость</h3>
        <div className={css.badges}>
          {s.applicability.map((a) => (
            <Badge key={a.id} tone="success">
              {a.industry.name} / {a.objectType?.name ?? 'вся отрасль'} — {(a.suitabilityScore * 100).toFixed(0)}%
            </Badge>
          ))}
        </div>
      </section>
      <CasesList solutionId={s.id} />
      <RatingForm
        solutionId={s.id}
        onRated={() => {
          void solution.refetch()
        }}
      />
      <div>
        {projectId ? (
          <Link className={css.link} to={getProjectRoute(projectId)}>
            → К экономике проекта
          </Link>
        ) : (
          <Link className={css.link} to={getCatalogRoute()}>
            ← Назад в каталог
          </Link>
        )}
      </div>
    </Segment>
  )
}
