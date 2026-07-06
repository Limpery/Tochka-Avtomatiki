import { getViewMemeRoute } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import { Link } from 'react-router-dom'

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
      <h1>All Memes</h1>
      <div>
        {data?.memes.map((mem) => (
          <div key={mem.name}>
            <h2>
              <Link to={getViewMemeRoute(mem.name)}>{mem.title}</Link>
            </h2>
            <p>{mem.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
