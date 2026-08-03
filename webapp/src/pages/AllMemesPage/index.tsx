import { getViewMemeRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import { Link } from 'react-router-dom'
import css from './index.module.scss'
import { Segment } from '../../components/Segment'

export const AllMemesPage = () => {
  const { data, error, isLoading, isFetching, isError } = trpc.getMemes.useQuery()

  if (isLoading || isFetching) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error {error.message}...</div>
  }

  return (
    <Segment title="All Memes">
      <div className={css.memes}>
        {data?.memes.map((mem) => (
          <div className={css.mem} key={mem.name}>
            <Segment
              size={2}
              description={mem.description}
              title={
                <Link className={css.memLink} to={getViewMemeRoute(mem.name)}>
                  {mem.title}
                </Link>
              }
            ></Segment>
          </div>
        ))}
      </div>
    </Segment>
  )
}
