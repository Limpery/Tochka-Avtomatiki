import { getViewMemeRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import { Link } from 'react-router-dom'
import css from './index.module.scss'

export const AllMemesPage = () => {
  const { data, error, isLoading, isFetching, isError } = trpc.getMemes.useQuery()

  if (isLoading || isFetching) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error {error.message}...</div>
  }

  return (
    <div>
      <h1 className={css.title}>All Memes</h1>
      <div className={css.memes}>
        {data?.memes.map((mem) => (
          <div className={css.mem} key={mem.name}>
            <h2 className={css.memName}>
              <Link className={css.memLink} to={getViewMemeRoute(mem.name)}>
                {mem.title}
              </Link>
            </h2>
            <p className={css.memDescription}>{mem.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
