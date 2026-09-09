import { getViewRobotRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import { Link } from 'react-router-dom'
import css from './index.module.scss'
import { Segment } from '../../components/Segment'

export const AllRobotsPage = () => {
  const { data, error, isLoading, isFetching, isError } = trpc.getRobots.useQuery()

  if (isLoading || isFetching) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <Segment title="All Robots">
      <div className={css.robots}>
        {data?.map((robot) => (
          <div className={css.robot} key={robot.name}>
            <Segment
              size={2}
              description={robot.description}
              title={
                <Link className={css.robotLink} to={getViewRobotRoute(robot.name)}>
                  {robot.title}
                </Link>
              }
            />
          </div>
        ))}
      </div>
    </Segment>
  )
}
