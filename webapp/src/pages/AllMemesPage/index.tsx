import { trpc } from '../../lib/trpc'

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
        {data.memes.map((mem) => {
          return (
            <div key={mem.id}>
              <h2>{mem.title}</h2>
              <p>{mem.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
