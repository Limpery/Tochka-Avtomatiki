import { useMemo } from 'react'
import { trpc } from '../../lib/trpc'
import { useCatalogFilterStore } from '../../stores/catalogFilterStore'
import { Segment } from '../../components/Segment'
import { SolutionCard } from '../../components/SolutionCard'
import { FilterDrawer, FilterDrawerButton } from '../../components/FilterDrawer'
import css from './index.module.scss'

// Почему главная — каталог: витрина решений с поиском и фильтрами,
// мастер создания проекта остался на ObjectSelectPage и связывается через auth.
export const HomeCatalogPage = () => {
  const applied = useCatalogFilterStore((s) => s.applied)

  const solutions = trpc.listSolutions.useQuery({
    industrySlug: applied.industrySlug || undefined,
    objectTypeSlug: applied.objectTypeSlug || undefined,
    categorySlug: applied.categorySlug || undefined,
    tagSlugs: applied.tagSlugs.length > 0 ? applied.tagSlugs : undefined,
    search: applied.search || undefined,
  })

  const visible = useMemo(() => {
    // Почему цена фильтруется на клиенте: в API ценового фильтра нет,
    // подмножество каталога маленькое — фильтрация мгновенная без round-trip.
    const min = Number(applied.priceMin)
    const max = Number(applied.priceMax)
    return (solutions.data ?? []).filter((s) => {
      if (applied.priceMin && (s.priceMin === null || s.priceMin < min)) {
        return false
      }
      if (applied.priceMax && (s.priceMin === null || s.priceMin > max)) {
        return false
      }
      return true
    })
  }, [solutions.data, applied.priceMin, applied.priceMax])

  return (
    <Segment
      title="Роботизированные решения"
      description="Подберите AGV, AMR, манипуляторы и дронов под ваш объект — справа фильтры, сверху поиск."
    >
      <div className={css.toolbar}>
        <div className={css.count}>{solutions.isLoading ? 'Загружаем…' : `Найдено: ${visible.length}`}</div>
        <FilterDrawerButton />
      </div>
      <div className={css.grid}>
        {visible.map((s) => (
          <SolutionCard key={s.id} solution={s} />
        ))}
      </div>
      {!solutions.isLoading && visible.length === 0 && (
        <div className={css.hint}>Ничего не найдено — измените поиск или фильтры.</div>
      )}
      <FilterDrawer />
    </Segment>
  )
}
