import { Link } from 'react-router-dom'
import { trpc } from '../../lib/trpc'
import { getObjectSelectRoute, getProjectRoute } from '../../lib/routes'
import { Segment } from '../../components/Segment'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import css from './index.module.scss'

export const ProjectsPage = () => {
  const projects = trpc.listProjects.useQuery()
  return (
    <Segment title="Шаг 3. Проекты" description="Ваши объекты и расчёты экономики. Новый проект создаётся на шаге 1.">
      {projects.isLoading && <div className={css.hint}>Загрузка…</div>}
      <div className={css.grid}>
        {projects.data?.map((p) => (
          <Card key={p.id} className={css.projectCard}>
            <Link className={css.name} to={getProjectRoute(p.id)}>
              {p.name}
            </Link>
            <div className={css.badges}>
              <Badge tone="info">{p.objectType.name}</Badge>
              <Badge>{p.industry.name}</Badge>
              <Badge tone="accent">процессов: {p.processesCount}</Badge>
              <Badge tone="accent">расчётов: {p.calculationsCount}</Badge>
            </div>
            {p.description && <p className={css.desc}>{p.description}</p>}
          </Card>
        ))}
      </div>
      {projects.data?.length === 0 && (
        <div className={css.hint}>
          Проектов пока нет —{' '}
          <Link className={css.link} to={getObjectSelectRoute()}>
            создайте первый
          </Link>
          .
        </div>
      )}
    </Segment>
  )
}
