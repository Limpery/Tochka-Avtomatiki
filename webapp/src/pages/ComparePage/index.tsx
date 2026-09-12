import { useParams } from 'react-router-dom'
import cn from 'classnames'
import { trpc } from '../../lib/trpc'
import { Segment } from '../../components/Segment'
import { Card } from '../../components/Card'
import css from './index.module.scss'

export const ComparePage = () => {
  const { id } = useParams()
  const comparison = trpc.comparisons.get.useQuery({ id: Number(id) }, { enabled: !!id })

  if (comparison.isLoading) {
    return <div className={css.hint}>Загрузка…</div>
  }
  if (!comparison.data) {
    return <div className={css.hint}>Сравнение не найдено</div>
  }
  const items = comparison.data.items
  const specNames = [...new Set(items.flatMap((i) => i.solution.specs.map((s) => s.specName)))]

  // Почему подсветка минимума: в сравнении цены ниже — лучше, глаз сразу видит победителя.
  const minPrice = Math.min(...items.map((i) => i.solution.priceMin ?? Number.POSITIVE_INFINITY))

  return (
    <Segment
      title={`Сравнение: ${comparison.data.name ?? `#${comparison.data.id}`}`}
      description="Зелёным подсвечена лучшая цена. Характеристики, которых нет у решения, отмечены прочерком."
    >
      <Card className={css.tableCard}>
        <table className={css.table}>
          <thead>
            <tr>
              <th className={css.sticky}>Показатель</th>
              {items.map((i) => (
                <th key={i.id}>{i.solution.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={css.sticky}>Вендор</td>
              {items.map((i) => (
                <td key={i.id}>{i.solution.vendor.name}</td>
              ))}
            </tr>
            <tr>
              <td className={css.sticky}>Цена, ₽</td>
              {items.map((i) => {
                const best = i.solution.priceMin !== null && i.solution.priceMin === minPrice
                return (
                  <td key={i.id} className={cn({ [css.best]: best })}>
                    {i.solution.priceMin?.toLocaleString('ru-RU') ?? '—'}
                  </td>
                )
              })}
            </tr>
            {specNames.map((name) => (
              <tr key={name}>
                <td className={css.sticky}>{name}</td>
                {items.map((i) => {
                  const spec = i.solution.specs.find((s) => s.specName === name)
                  return <td key={i.id}>{spec ? `${spec.specValue} ${spec.specUnit ?? ''}` : '—'}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Segment>
  )
}
