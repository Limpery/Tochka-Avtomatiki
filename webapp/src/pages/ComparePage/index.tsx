import { useParams } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { Segment } from '../../components/Segment'

export const ComparePage = () => {
  const { id } = useParams()
  const comparison = trpc.comparisons.get.useQuery({ id: Number(id) }, { enabled: !!id })

  if (comparison.isLoading) {
    return <div>Загрузка...</div>
  }
  if (!comparison.data) {
    return <div>Сравнение не найдено</div>
  }
  const items = comparison.data.items
  const specNames = [...new Set(items.flatMap((i) => i.solution.specs.map((s) => s.specName)))]

  return (
    <Segment title={`Сравнение: ${comparison.data.name ?? `#${comparison.data.id}`}`}>
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>Показатель</th>
            {items.map((i) => (
              <th key={i.id}>{i.solution.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Вендор</td>
            {items.map((i) => (
              <td key={i.id}>{i.solution.vendor.name}</td>
            ))}
          </tr>
          <tr>
            <td>Цена, ₽</td>
            {items.map((i) => (
              <td key={i.id}>{i.solution.priceMin?.toLocaleString('ru-RU') ?? '—'}</td>
            ))}
          </tr>
          {specNames.map((name) => (
            <tr key={name}>
              <td>{name}</td>
              {items.map((i) => {
                const spec = i.solution.specs.find((s) => s.specName === name)
                return <td key={i.id}>{spec ? `${spec.specValue} ${spec.specUnit ?? ''}` : '—'}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Segment>
  )
}
