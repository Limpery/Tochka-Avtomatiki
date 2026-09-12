import { Link } from 'react-router-dom'
import { getSolutionRoute } from '../../lib/routes'
import { Badge } from '../Badge'
import css from './index.module.scss'

export interface SolutionCardData {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  priceMin: number | null
  priceMax: number | null
  vendor: { name: string }
  category: { name: string; slug: string } | null
  avgRating: number | null
  ratingsCount: number
  suitabilityScore: number | null
  tags: Array<{ slug: string; name: string }>
}

// Почему карточка — ссылка целиком: детальный просмотр открывается кликом
// в любое место, вложенных интерактивных элементов внутри нет.
export const SolutionCard = ({ solution: s }: { solution: SolutionCardData }) => (
  <Link className={css.card} to={getSolutionRoute(s.slug)}>
    <div className={css.imageWrap}>
      {s.imageUrl ? (
        <img className={css.image} src={s.imageUrl} alt={s.name} loading="lazy" />
      ) : (
        <div className={css.imagePlaceholder}>
          <span className={css.imagePlaceholderIcon}>🤖</span>
          <span className={css.imagePlaceholderText}>Фото скоро</span>
        </div>
      )}
      {s.suitabilityScore !== null && (
        <span className={css.suitability}>
          <Badge tone="success">{(s.suitabilityScore * 100).toFixed(0)}%</Badge>
        </span>
      )}
    </div>
    <div className={css.body}>
      <div className={css.name}>{s.name}</div>
      <div className={css.meta}>
        {s.vendor.name} · {s.category?.name ?? '—'}
      </div>
      <div className={css.price}>{s.priceMin ? `${s.priceMin.toLocaleString('ru-RU')} ₽` : 'цена по запросу'}</div>
      <div className={css.badges}>
        {s.avgRating !== null && (
          <Badge tone="accent">
            ★ {s.avgRating.toFixed(1)} ({s.ratingsCount})
          </Badge>
        )}
        {s.tags.slice(0, 3).map((t) => (
          <Badge key={t.slug}>{t.name}</Badge>
        ))}
      </div>
      {s.description && <p className={css.desc}>{s.description}</p>}
    </div>
  </Link>
)
