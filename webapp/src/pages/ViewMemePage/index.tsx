import { useParams } from 'react-router-dom'
import type { ViewMemeRouteParams } from '../../lib/routes'
import { trpc } from '../../lib/trpc'
import css from './index.module.scss'
export const ViewMemePage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { nameMem } = useParams() as ViewMemeRouteParams

  const { data, error, isLoading, isFetching, isError } = trpc.getMem.useQuery({
    nameMem,
  })

  if (isLoading || isFetching) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error {error.message}...</div>
  }

  if (!data) {
    return <div>No mem found!</div>
  }

  if (!data.mem) {
    return <div>No mem found!</div>
  }

  return (
    <div>
      <h1 className={css.title}>{data.mem.name}</h1>
      <p className={css.description}>{data.mem.description}</p>
      <div className={css.text} dangerouslySetInnerHTML={{ __html: data.mem.text }} />
    </div>
  )
}
