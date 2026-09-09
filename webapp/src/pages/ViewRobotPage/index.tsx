import { useParams } from 'react-router-dom'
import type { ViewRobotRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'
import { Segment } from '../../components/Segment'
export const ViewRobotPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { nameRobot } = useParams() as ViewRobotRouteParams

  const { data, error, isLoading, isFetching, isError } = trpc.getRobot.useQuery({
    nameRobot,
  })

  if (isLoading || isFetching) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error {error.message}...</div>
  }

  if (!data) {
    return <div>No robot found!</div>
  }

  if (!data.robot) {
    return <div>No robot found!</div>
  }

  return (
    <Segment title={data.robot.name} description={data.robot.description}>
      <div className={css.text} dangerouslySetInnerHTML={{ __html: data.robot.text }} />
    </Segment>
  )
}
