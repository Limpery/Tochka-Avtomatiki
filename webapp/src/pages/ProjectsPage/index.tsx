import { Link } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { getProjectRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'

export const ProjectsPage = () => {
  const projects = trpc.listProjects.useQuery()
  return (
    <Segment title="Шаг 3. Проекты">
      {projects.data?.map((p) => (
        <div key={p.id} style={{ border: '1px solid #ccc', margin: '8px 0', padding: 8 }}>
          <Link to={getProjectRoute(p.id)}>
            <b>{p.name}</b>
          </Link>{' '}
          — {p.objectType.name} ({p.industry.name}) · процессов: {p.processesCount} · расчетов: {p.calculationsCount}
        </div>
      ))}
    </Segment>
  )
}
